package shared

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"
)

type Client struct {
	HttpClient *http.Client
	UserAgent  string
	BaseUrl    string
}

func NewClient(userAgent, baseUrl string) *Client {
	return &Client{
		HttpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		UserAgent: userAgent,
		BaseUrl:   baseUrl,
	}
}

func (c *Client) Get(endpoint string, result any) error {
	requestURL := c.BaseUrl + endpoint

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

		req.Header.Set("User-Agent", c.UserAgent)

		resp, err := c.HttpClient.Do(req)
		if err != nil {
			if attempt == maxRetries {
				return fmt.Errorf("request failed: %w", err)
			}
			continue
		}

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

		err = resp.Body.Close()
		if err != nil {
			return err
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
	err := c.Get(endpoint, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
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
		req.Header.Set("User-Agent", c.UserAgent)

		resp, err := c.HttpClient.Do(req)
		if err != nil {
			if attempt == maxRetries {
				return "", fmt.Errorf("download failed: %w", err)
			}
			continue
		}

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

		_, err = io.Copy(out, resp.Body)
		if err != nil {
			if attempt == maxRetries {
				return "", fmt.Errorf("failed to write file: %w", err)
			}
			err := out.Close()
			if err != nil {
				return "", err
			}

			err = os.Remove(destPath)
			if err != nil {
				return "", err
			}

			err = resp.Body.Close()
			if err != nil {
				return "", err
			}
			continue
		}

		err = out.Close()
		if err != nil {
			return "", err
		}

		err = resp.Body.Close()
		if err != nil {
			return "", err
		}

		return destPath, nil
	}

	return "", fmt.Errorf("download failed after %d retries", maxRetries)
}
