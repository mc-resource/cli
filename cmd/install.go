package cmd

import (
	"fmt"
	"os"

	"mcr/manifest"
	"mcr/registry"
	modrinth_v2 "mcr/registry/modrinth/v2"
	modrinth_v3 "mcr/registry/modrinth/v3"

	"github.com/spf13/cobra"
)

var installCmd = &cobra.Command{
	Use:     "install [resources...]",
	Aliases: []string{"i"},
	Short:   "Install the specified resource(s)",
	Long: `Description: Retrieve and install the specified resource(s)
along with their dependencies from the registry.

Examples:
  mcr install fabric-api lithium sodium
  mcr install --loader forge jei
  mcr install --game-version 1.20.1 --registry modrinth fabric-api`,
	Run: func(cmd *cobra.Command, args []string) {
		err := runInstall(cmd, args)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
	},
}

func init() {
	rootCmd.AddCommand(installCmd)

	installCmd.Flags().StringP("loader", "l", "", "Mod loader to use (overrides concrete.json)")
	installCmd.Flags().StringP("game-version", "g", "", "Minecraft version (overrides concrete.json)")
	installCmd.Flags().StringP("registry", "r", "modrinth", "Registry to download from (modrinth, etc.)")
	installCmd.Flags().BoolP("dev", "S", false, "Install dev dependencies")
}

func runInstall(cmd *cobra.Command, args []string) error {
	loaderFlag, _ := cmd.Flags().GetString("loader")
	gameVersionFlag, _ := cmd.Flags().GetString("game-version")
	registryFlag, _ := cmd.Flags().GetString("registry")
	isDevFlag, _ := cmd.Flags().GetBool("dev")

	concrete, err := manifest.ReadConcrete("")
	if err != nil {
		return fmt.Errorf("no concrete.json found in the current directory. Please run 'mcr init' first")
	}

	loader := loaderFlag
	gameVersion := gameVersionFlag

	if loader == "" {
		loader = concrete.Loader
	}
	if gameVersion == "" {
		gameVersion = concrete.GameVersion
	}

	client, err := createRegistryClient(registryFlag)
	if err != nil {
		return err
	}

	lock, _ := manifest.ReadLock("")
	if lock == nil {
		lock = &manifest.Lock{
			Name:         concrete.Name,
			Version:      concrete.Version,
			Loader:       concrete.Loader,
			GameVersion:  concrete.GameVersion,
			Dependencies: make(map[string]manifest.LockEntry),
		}
	}

	lock.CleanStaleDependencies()

	installedCount := 0

	for name := range concrete.Dependencies {
		_, err := installResource(client, name, loader, gameVersion, registryFlag, lock)
		if err != nil {
			fmt.Printf("  ✗ %s: %s\n", name, err)
			continue
		}
		installedCount++
	}

	for name := range concrete.DevDependencies {
		_, err := installResource(client, name, loader, gameVersion, registryFlag, lock)
		if err != nil {
			fmt.Printf("  ✗ %s (dev): %s\n", name, err)
			continue
		}
		installedCount++
	}

	if len(args) > 0 {
		for _, resourceName := range args {
			if _, exists := concrete.Dependencies[resourceName]; exists {
				continue
			}
			if _, exists := concrete.DevDependencies[resourceName]; exists {
				continue
			}

			result, err := installResource(client, resourceName, loader, gameVersion, registryFlag, lock)
			if err != nil {
				fmt.Printf("  ✗ %s: %s\n", resourceName, err)
				continue
			}

			concrete.AddDependency(resourceName, result.Version, isDevFlag)
			installedCount++
		}

		err = manifest.WriteConcrete("", concrete)
		if err != nil {
			return fmt.Errorf("failed to update concrete.json: %w", err)
		}
	}

	err = manifest.WriteLock("", lock)
	if err != nil {
		return fmt.Errorf("failed to update lock file: %w", err)
	}

	fmt.Printf("\nInstalled %d resource(s)\n", installedCount)

	return nil
}

func createRegistryClient(registryName string) (registry.Client, error) {
	switch registryName {
	case "modrinth", "modrinth@v2":
		return modrinth_v2.NewClient("mc-resource/cli"), nil
	case "modrinth@v3":
		return modrinth_v3.NewClient("mc-resource/cli"), nil
	default:
		return nil, fmt.Errorf("unsupported registry: %s \nsupported: modrinth, modrinth@v3", registryName)
	}
}

func installResource(client registry.Client, slug, loader, gameVersion, registryName string, lock *manifest.Lock) (*registry.InstallResult, error) {
	var existingHash string
	var oldFilePath string
	for path, entry := range lock.Dependencies {
		if entry.Name == slug && entry.Registry == registryName {
			existingHash = entry.Hash
			oldFilePath = path
			break
		}
	}

	result, err := client.Install(slug, loader, gameVersion, ".", existingHash)
	if err != nil {
		return nil, err
	}

	if oldFilePath != "" && oldFilePath != result.FilePath {
		delete(lock.Dependencies, oldFilePath)
		os.Remove(oldFilePath)
	}

	lock.Dependencies[result.FilePath] = manifest.LockEntry{
		Name:     slug,
		Version:  result.Version,
		Hash:     result.Hash,
		Registry: registryName,
		Engines: []string{
			loader,
			"minecraft-" + gameVersion,
		},
	}

	return result, nil
}
