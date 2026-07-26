// Package registry provides common interfaces and types for all registry implementations.
package registry

// InstallResult contains the outcome of installing a single resource.
type InstallResult struct {
	Installed bool   // Whether the file was actually downloaded (false if already up-to-date)
	Version   string // The resolved version number
	FilePath  string // The destination file path (e.g., "mods/fabric-api-0.141.3.jar")
	Hash      string // The SHA1 hash of the installed file
}

// Client is the interface that all registry clients must implement.
// This allows the install command to work with any registry (Modrinth, CurseForge, etc.)
// without hardcoding a specific implementation.
//
// In Go, interfaces are implemented implicitly — a type satisfies an interface
// just by having the right methods. No "implements" keyword needed!
type Client interface {
	// Install resolves, downloads, and installs a resource.
	// Returns InstallResult with installation details, or error if failed.
	//
	// slug:        Resource identifier (e.g., "fabric-api")
	// loader:      Mod loader (e.g., "fabric", "forge")
	// gameVersion: Minecraft version (e.g., "1.21.4")
	// destBaseDir: Base directory for installation (e.g., current directory)
	// existingHash: SHA1 hash of existing installation (empty if not installed)
	Install(slug, loader, gameVersion, destBaseDir, existingHash string) (*InstallResult, error)
}

// GetInstallDir returns the appropriate installation directory based on resource type.
//
// Resource types:
//   - "mod"          → "mods/"
//   - "shader"       → "shaderpacks/"
//   - "resourcepack" → "resourcepacks/"
//   - "plugin"       → "plugins/"
//   - unrecognized   → "concrete_unresolved/"
func GetInstallDir(resourceType string) string {
	switch resourceType {
	case "mod":
		return "mods"
	case "shader":
		return "shaderpacks"
	case "resourcepack":
		return "resourcepacks"
	case "plugin":
		return "plugins"
	default:
		return "concrete_unresolved"
	}
}
