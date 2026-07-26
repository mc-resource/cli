package manifest

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Concrete struct {
	Name            string            `json:"name"`
	Version         string            `json:"version"`
	Description     string            `json:"description"`
	License         string            `json:"license"`
	Loader          string            `json:"loader"`
	GameVersion     string            `json:"game_version"`
	Authors         []string          `json:"authors"`
	Dependencies    map[string]string `json:"dependencies"`
	DevDependencies map[string]string `json:"devDependencies,omitempty"`
}

type Lock struct {
	Name         string               `json:"name"`
	Version      string               `json:"version"`
	Loader       string               `json:"loader"`
	GameVersion  string               `json:"game_version"`
	Dependencies map[string]LockEntry `json:"dependencies"`
}

// LockEntry represents a single resolved dependency in the lock file.
// The key in the Dependencies map is the file path where this is installed.
// Example:
//
//	"mods/fabric-api-0.92.0.jar": {
//	  "version": "0.92.0",
//	  "hash": "abc123...",
//	  "registry": "modrinth",
//	  "engines": ["fabric-loader-0.19.2", "minecraft-1.20.1"]
//	}
type LockEntry struct {
	Name     string   `json:"name"`
	Version  string   `json:"version"`
	Authors  []string `json:"authors,omitempty"`
	License  string   `json:"license"`
	Hash     string   `json:"hash"`
	Registry string   `json:"registry"`
	Engines  []string `json:"engines"`
}

const (
	ConcreteFileName = "concrete.json"
	LockFileName     = "concrete.lock"
)

func ReadConcrete(dir string) (*Concrete, error) {
	if dir == "" {
		var err error
		dir, err = os.Getwd()
		if err != nil {
			return nil, err
		}
	}

	filePath := filepath.Join(dir, ConcreteFileName)
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var concrete Concrete
	err = json.Unmarshal(data, &concrete)
	if err != nil {
		return nil, fmt.Errorf("invalid concrete.json: %w", err)
	}

	return &concrete, nil
}

func WriteConcrete(dir string, concrete *Concrete) error {
	if dir == "" {
		var err error
		dir, err = os.Getwd()
		if err != nil {
			return err
		}
	}

	filePath := filepath.Join(dir, ConcreteFileName)

	data, err := json.MarshalIndent(concrete, "", "  ")
	if err != nil {
		return fmt.Errorf("could not generate JSON: %w", err)
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return fmt.Errorf("could not write file: %w", err)
	}

	return nil
}

func ReadLock(dir string) (*Lock, error) {
	if dir == "" {
		var err error
		dir, err = os.Getwd()
		if err != nil {
			return nil, err
		}
	}

	filePath := filepath.Join(dir, LockFileName)
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	var lock Lock
	err = json.Unmarshal(data, &lock)
	if err != nil {
		return nil, fmt.Errorf("invalid concrete.lock: %w", err)
	}

	return &lock, nil
}

func WriteLock(dir string, lock *Lock) error {
	if dir == "" {
		var err error
		dir, err = os.Getwd()
		if err != nil {
			return err
		}
	}

	if lock == nil {
		concrete, err := ReadConcrete(dir)
		if err != nil {
			return fmt.Errorf("cannot generate lock file without concrete.json: %w", err)
		}

		lock = &Lock{
			Name:         concrete.Name,
			Version:      concrete.Version,
			Loader:       concrete.Loader,
			GameVersion:  concrete.GameVersion,
			Dependencies: make(map[string]LockEntry),
		}
	}

	filePath := filepath.Join(dir, LockFileName)

	data, err := json.MarshalIndent(lock, "", "  ")
	if err != nil {
		return fmt.Errorf("could not generate JSON: %w", err)
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return fmt.Errorf("could not write file: %w", err)
	}

	return nil
}

func (c *Concrete) AddDependency(name, version string, isDev bool) {
	if c.Dependencies == nil {
		c.Dependencies = make(map[string]string)
	}
	if c.DevDependencies == nil {
		c.DevDependencies = make(map[string]string)
	}

	if isDev {
		c.DevDependencies[name] = version
	} else {
		c.Dependencies[name] = version
	}
}

func (c *Concrete) RemoveDependency(name string) {
	delete(c.Dependencies, name)
	delete(c.DevDependencies, name)
}

func (l *Lock) CleanStaleDependencies() {
	for path := range l.Dependencies {
		if _, err := os.Stat(path); os.IsNotExist(err) {
			delete(l.Dependencies, path)
		}
	}
}
