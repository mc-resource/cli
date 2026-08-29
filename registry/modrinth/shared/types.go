package shared

type SearchResponse struct {
	Hits      []SearchHit `json:"hits"`
	Offset    int         `json:"offset"`
	Limit     int         `json:"limit"`
	TotalHits int         `json:"total_hits"`
}

type SearchHit struct {
	ProjectID         string   `json:"project_id"`
	Slug              string   `json:"slug"`
	Name              string   `json:"name"`
	Summary           string   `json:"summary"`
	Author            string   `json:"author"`
	Categories        []string `json:"categories"`
	DisplayCategories []string `json:"display_categories"`
	ProjectTypes      []string `json:"project_types"`
	Downloads         int      `json:"downloads"`
	Follows           int      `json:"follows"`
	IconURL           string   `json:"icon_url"`
	License           string   `json:"license"`
	DateCreated       string   `json:"date_created"`
	DateModified      string   `json:"date_modified"`
	Loaders           []string `json:"loaders"`
	GameVersions      []string `json:"game_versions"`
	VersionID         string   `json:"version_id"`
	FeaturedGallery   string   `json:"featured_gallery"`
	Color             int      `json:"color"`
}

type License struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

type File struct {
	ID       string     `json:"id"`
	Hashes   FileHashes `json:"hashes"`
	URL      string     `json:"url"`
	Filename string     `json:"filename"`
	Primary  bool       `json:"primary"`
	Size     int        `json:"size"`
	FileType *string    `json:"file_type"`
}

type FileHashes struct {
	SHA1   string `json:"sha1"`
	SHA512 string `json:"sha512"`
}

type Dependency struct {
	VersionID      *string `json:"version_id"`
	ProjectID      *string `json:"project_id"`
	FileName       *string `json:"file_name"`
	DependencyType string  `json:"dependency_type"` // "required", "optional", "incompatible", "embedded"
}
