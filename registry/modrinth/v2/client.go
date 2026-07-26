package modrinth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"mcr/registry"
)

const BaseURL = "https://api.modrinth.com/v2"

type Client struct {
	httpClient *http.Client
	userAgent  string
}

func NewClient(userAgent string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		userAgent: userAgent,
	}
}

func (c *Client) get(endpoint string, result any) error {
	requestURL := BaseURL + endpoint

	maxRetries := 3
	baseDelay := 1 * time.Second

	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			delay := baseDelay * time.Duration(1<<uint(attempt-1))
			fmt.Printf("  ⏳ Rate limited, retrying in %v... (attempt %d/%d)\n", delay, attempt, maxRetries)
			time.Sleep(delay)
		}

		req, err := http.NewRequest("GET", requestURL, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("User-Agent", c.userAgent)

		resp, err := c.httpClient.Do(req)
		if err != nil {
			if attempt == maxRetries {
				return fmt.Errorf("request failed: %w", err)
			}
			continue
		}

		defer resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			if attempt < maxRetries {
				continue
			}
			return fmt.Errorf("modrinth API rate limit exceeded after %d retries", maxRetries)
		}

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("modrinth API error (HTTP %d): %s", resp.StatusCode, string(body))
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response: %w", err)
		}

		err = json.Unmarshal(body, result)
		if err != nil {
			return fmt.Errorf("failed to parse JSON: %w", err)
		}

		return nil
	}

	return fmt.Errorf("max retries exceeded")
}

func (c *Client) Search(query string, facets string, limit, offset int) (*SearchResponse, error) {
	endpoint := fmt.Sprintf("/search?query=%s&limit=%d&offset=%d",
		url.QueryEscape(query), limit, offset)

	if facets != "" {
		endpoint += "&facets=" + url.QueryEscape(facets)
	}

	var result SearchResponse
	err := c.get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *Client) GetProject(idOrSlug string) (*Project, error) {
	endpoint := fmt.Sprintf("/project/%s", url.PathEscape(idOrSlug))

	var result Project
	err := c.get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *Client) ListVersions(idOrSlug string, loaders, gameVersions []string) ([]Version, error) {
	endpoint := fmt.Sprintf("/project/%s/version", url.PathEscape(idOrSlug))

	params := url.Values{}

	if len(loaders) > 0 {
		loadersJSON, _ := json.Marshal(loaders)
		params.Set("loaders", string(loadersJSON))
	}

	if len(gameVersions) > 0 {
		versionsJSON, _ := json.Marshal(gameVersions)
		params.Set("game_versions", string(versionsJSON))
	}

	if encoded := params.Encode(); encoded != "" {
		endpoint += "?" + encoded
	}

	var result []Version
	err := c.get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (c *Client) GetVersion(versionID string) (*Version, error) {
	endpoint := fmt.Sprintf("/version/%s", url.PathEscape(versionID))

	var result Version
	err := c.get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *Client) GetLatestRelease(idOrSlug string, loader string, gameVersion string) (*Version, error) {
	versions, err := c.ListVersions(idOrSlug, []string{loader}, []string{gameVersion})
	if err != nil {
		return nil, err
	}

	for i := range versions {
		if versions[i].VersionType == "release" {
			return &versions[i], nil
		}
	}

	if len(versions) > 0 {
		return &versions[0], nil
	}

	return nil, fmt.Errorf("no versions found for %s (loader: %s, game: %s)", idOrSlug, loader, gameVersion)
}

func GetPrimaryFile(version *Version) (*File, error) {
	if len(version.Files) == 0 {
		return nil, fmt.Errorf("version %s has no primary files", version.ID)
	}

	for i := range version.Files {
		if version.Files[i].Primary {
			return &version.Files[i], nil
		}
	}

	return &version.Files[0], nil
}

func (c *Client) DownloadFile(destDir string, file *File) (string, error) {
	err := os.MkdirAll(destDir, 0755)
	if err != nil {
		return "", fmt.Errorf("failed to create directory %s: %w", destDir, err)
	}

	destPath := filepath.Join(destDir, file.Filename)

	maxRetries := 3
	baseDelay := 1 * time.Second

	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			delay := baseDelay * time.Duration(1<<uint(attempt-1))
			fmt.Printf("  ⏳ Download retry in %v... (attempt %d/%d)\n", delay, attempt, maxRetries)
			time.Sleep(delay)
		}

		req, err := http.NewRequest("GET", file.URL, nil)
		if err != nil {
			return "", fmt.Errorf("failed to create download request: %w", err)
		}
		req.Header.Set("User-Agent", c.userAgent)

		resp, err := c.httpClient.Do(req)
		if err != nil {
			if attempt == maxRetries {
				return "", fmt.Errorf("download failed: %w", err)
			}
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			if attempt < maxRetries {
				continue
			}
			return "", fmt.Errorf("download failed: rate limited after %d retries", maxRetries)
		}

		if resp.StatusCode != http.StatusOK {
			if attempt == maxRetries {
				return "", fmt.Errorf("download failed (HTTP %d)", resp.StatusCode)
			}
			continue
		}

		out, err := os.Create(destPath)
		if err != nil {
			return "", fmt.Errorf("failed to create file %s: %w", destPath, err)
		}
		defer out.Close()

		_, err = io.Copy(out, resp.Body)
		if err != nil {
			if attempt == maxRetries {
				return "", fmt.Errorf("failed to write file: %w", err)
			}
			out.Close()
			os.Remove(destPath)
			continue
		}

		return destPath, nil
	}

	return "", fmt.Errorf("download failed after %d retries", maxRetries)
}

func (c *Client) Install(slug, loader, gameVersion, destBaseDir, existingHash string) (*registry.InstallResult, error) {
	project, err := c.GetProject(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	version, err := c.GetLatestRelease(slug, loader, gameVersion)
	if err != nil {
		return nil, fmt.Errorf("failed to get version: %w", err)
	}

	file, err := GetPrimaryFile(version)
	if err != nil {
		return nil, fmt.Errorf("failed to get primary file: %w", err)
	}

	if existingHash != "" && existingHash == file.Hashes.SHA1 {
		fmt.Printf("  ✓ %s (%s) (already installed)\n", slug, version.VersionNumber)

		resourceType := ""
		if project.ProjectType != "" {
			resourceType = project.ProjectType
		}
		installDir := registry.GetInstallDir(resourceType)
		destPath := filepath.Join(destBaseDir, installDir, file.Filename)

		return &registry.InstallResult{
			Installed: false,
			FilePath:  destPath,
			Version:   version.VersionNumber,
			Hash:      file.Hashes.SHA1,
		}, nil
	}

	resourceType := ""
	if project.ProjectType != "" {
		resourceType = project.ProjectType
	}

	installDir := registry.GetInstallDir(resourceType)
	destDir := filepath.Join(destBaseDir, installDir)

	fmt.Printf("  ↓ %s (%s)\n", slug, version.VersionNumber)

	destPath, err := c.DownloadFile(destDir, file)
	if err != nil {
		return nil, fmt.Errorf("failed to download: %w", err)
	}

	fmt.Printf("  ✓ %s (%s)\n", slug, version.VersionNumber)

	return &registry.InstallResult{
		Installed: true,
		FilePath:  destPath,
		Version:   version.VersionNumber,
		Hash:      file.Hashes.SHA1,
	}, nil
}
