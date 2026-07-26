package utils

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func Prompt(prompt string) (string, error) {
	fmt.Print(prompt)
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() {
		return strings.TrimSpace(scanner.Text()), nil
	}
	return "", scanner.Err()
}

func ListPrompt(prompt string) ([]string, error) {
	fmt.Print(prompt)
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			return []string{}, nil
		}
		return strings.Split(input, ","), nil
	}
	return nil, scanner.Err()
}
