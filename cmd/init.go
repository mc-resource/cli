package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"mcr/manifest"
	"mcr/utils"

	"github.com/spf13/cobra"
)

type InitCommandPrompts struct {
	Name        string
	Version     string
	Description string
	License     string
	Loader      string
	GameVersion string
	Authors     []string
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize mcr at directory",
	Long: `Description: Initialize an mcr project and create a
manifest file (concrete.json) at the current directory.`,
	Run: func(cmd *cobra.Command, args []string) {
		err := runInit(cmd)

		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		fmt.Println("concrete.json created successfully!")
	},
}

func init() {
	rootCmd.AddCommand(initCmd)

	initCmd.Flags().StringP("name", "n", "", "Specify the project name")
	initCmd.Flags().StringP("version", "v", "", "Specify the project version")
	initCmd.Flags().StringP("description", "d", "", "Specify the project description")
	initCmd.Flags().StringP("license", "L", "", "Specify the project license (e.g., MIT, Apache-2.0)")
	initCmd.Flags().StringP("loader", "l", "", "Specify the loader for the project (e.g., vanilla, forge, fabric)")
	initCmd.Flags().StringP("game-version", "g", "", "Specify the game version for the project (e.g., 1.21.11)")
	initCmd.Flags().StringSliceP("authors", "a", []string{}, "Specify the authors of the project (comma separated)")
}

func runInit(cmd *cobra.Command) error {
	flags := cmd.Flags()

	name, _ := flags.GetString("name")
	version, _ := flags.GetString("version")
	description, _ := flags.GetString("description")
	license, _ := flags.GetString("license")
	loader, _ := flags.GetString("loader")
	gameVersion, _ := flags.GetString("game-version")
	authors, _ := flags.GetStringSlice("authors")

	options := InitCommandPrompts{
		Name:        name,
		Version:     version,
		Description: description,
		Loader:      loader,
		GameVersion: gameVersion,
		Authors:     authors,
		License:     license,
	}

	err := initializeConcrete(options)
	return err
}

func initializeConcrete(options InitCommandPrompts) error {
	dir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("could not get current directory: %w", err)
	}

	filePath := filepath.Join(dir, manifest.ConcreteFileName)

	if _, err := os.Stat(filePath); err == nil {
		return fmt.Errorf("concrete.json already exists in %s", dir)
	}

	if options.Name == "" {
		options.Name, _ = utils.Prompt("Project name: ")
	}
	if options.Version == "" {
		options.Version, _ = utils.Prompt("Project version: ")
	}
	if options.Description == "" {
		options.Description, _ = utils.Prompt("Project description: ")
	}
	if options.License == "" {
		options.License, _ = utils.Prompt("Project license (e.g., MIT, Apache-2.0): ")
	}
	if options.Loader == "" {
		options.Loader, _ = utils.Prompt("Loader (e.g., vanilla, forge, fabric): ")
	}
	if options.GameVersion == "" {
		options.GameVersion, _ = utils.Prompt("Game version (e.g., 1.21.11): ")
	}
	if len(options.Authors) == 0 {
		options.Authors, _ = utils.ListPrompt("Authors (comma separated): ")
	}

	concrete := &manifest.Concrete{
		Name:            options.Name,
		Version:         options.Version,
		Description:     options.Description,
		License:         options.License,
		Loader:          options.Loader,
		GameVersion:     options.GameVersion,
		Authors:         options.Authors,
		Dependencies:    map[string]string{},
		DevDependencies: map[string]string{},
	}

	err = manifest.WriteConcrete(dir, concrete)
	if err != nil {
		return err
	}

	return nil
}
