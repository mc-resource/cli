package v3

import "mcr/registry/modrinth/shared"

type Project struct {
	ID            string         `json:"id"`
	Slug          string         `json:"slug"`
	Name          string         `json:"name"`
	Summary       string         `json:"summary"`
	Description   string         `json:"description"`
	Categories    []string       `json:"categories"`
	ProjectTypes  []string       `json:"project_types"`
	Downloads     int            `json:"downloads"`
	Followers     int            `json:"followers"`
	IconURL       string         `json:"icon_url"`
	License       shared.License `json:"license"`
	DateCreated   string         `json:"date_created"`
	DateModified  string         `json:"date_modified"`
	DatePublished string         `json:"date_published"`
	Loaders       []string       `json:"loaders"`
	GameVersions  []string       `json:"game_versions"`
	Versions      []string       `json:"versions"`
	Status        string         `json:"status"`
}

type Version struct {
	ID            string              `json:"id"`
	ProjectID     string              `json:"project_id"`
	AuthorID      string              `json:"author_id"`
	Name          string              `json:"name"`
	VersionNumber string              `json:"version_number"`
	VersionType   string              `json:"version_type"`  // "release", "beta", "alpha"
	ProjectTypes  []string            `json:"project_types"` // "mod", "shader", "resourcepack", "plugin"
	Status        string              `json:"status"`
	DatePublished string              `json:"date_published"`
	Downloads     int                 `json:"downloads"`
	Files         []shared.File       `json:"files"`
	Dependencies  []shared.Dependency `json:"dependencies"`
	GameVersions  []string            `json:"game_versions"`
	Loaders       []string            `json:"loaders"`
	Featured      bool                `json:"featured"`
}
