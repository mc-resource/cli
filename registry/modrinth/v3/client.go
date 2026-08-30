package v3

import (
	"encoding/json"
	"fmt"
	"mcr/registry"
	"mcr/registry/modrinth/shared"
	"net/url"
	"path/filepath"
	"time"

	"github.com/briandowns/spinner"
)

const BaseURL = "https://api.modrinth.com/v3"

type Client struct {
	*shared.Client
}

func NewClient(userAgent string) *Client {
	return &Client{
		shared.NewClient(userAgent, BaseURL),
	}
}

func (c *Client) GetProject(idOrSlug string) (*Project, error) {
	endpoint := fmt.Sprintf("/project/%s", url.PathEscape(idOrSlug))

	var result Project
	err := c.Get(endpoint, &result)
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
	err := c.Get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (c *Client) GetVersion(versionID string) (*Version, error) {
	endpoint := fmt.Sprintf("/version/%s", url.PathEscape(versionID))

	var result Version
	err := c.Get(endpoint, &result)
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

func GetPrimaryFile(version *Version) (*shared.File, error) {
	if len(version.Files) == 0 {
		return nil, fmt.Errorf("version %s has no files", version.ID)
	}

	for i := range version.Files {
		if version.Files[i].Primary {
			return &version.Files[i], nil
		}
	}

	return &version.Files[0], nil
}

func (c *Client) Install(slug, loader, gameVersion, destBaseDir, existingHash string) (*registry.InstallResult, error) {
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
		if len(version.ProjectTypes) > 0 {
			resourceType = version.ProjectTypes[0]
		}
		installDir := registry.GetInstallDir(resourceType)
		destPath := filepath.Join(destBaseDir, installDir, file.Filename)

		return &registry.InstallResult{
			Installed: false,
			FilePath:  destPath,
			Resource: registry.InstalledResource{
				Name:    slug,
				Version: version.VersionNumber,
				Hash:    file.Hashes.SHA1,
			},
		}, nil
	}

	resourceType := ""
	if len(version.ProjectTypes) > 0 {
		resourceType = version.ProjectTypes[0]
	}

	installDir := registry.GetInstallDir(resourceType)
	destDir := filepath.Join(destBaseDir, installDir)

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " " + slug + " (" + version.VersionNumber + ")"
	s.Start()

	destPath, err := c.DownloadFile(destDir, file)
	s.Stop()
	if err != nil {
		return nil, fmt.Errorf("failed to download: %w", err)
	}

	return &registry.InstallResult{
		Installed: true,
		FilePath:  destPath,
		Resource: registry.InstalledResource{
			Name:    slug,
			Version: version.VersionNumber,
			Hash:    file.Hashes.SHA1,
		},
	}, nil
}
