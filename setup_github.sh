#!/bin/bash

# GitHub Setup Script for Tweet Pattern Analyzer
# This script will help you push your code to GitHub

echo "🚀 GitHub Setup for Tweet Pattern Analyzer"
echo "=========================================="
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Please run this from the project root."
    exit 1
fi

echo "✅ Git repository detected"
echo ""

# Check if user has created the GitHub repo
echo "📝 STEP 1: Create GitHub Repository"
echo "------------------------------------"
echo "Please create a new PRIVATE repository on GitHub:"
echo ""
echo "1. Repository name: tweet-pattern-analyzer"
echo "2. Description: MVP for analyzing tweet patterns and generating engaging content"
echo "3. Visibility: ⚠️  PRIVATE (important!)"
echo "4. DO NOT initialize with README, .gitignore, or license"
echo ""
echo "GitHub new repo page should be open in your browser."
echo "If not, go to: https://github.com/new"
echo ""

# Prompt for repository URL
read -p "👉 Have you created the repository? (y/n): " created

if [ "$created" != "y" ]; then
    echo "❌ Please create the repository first, then run this script again."
    exit 0
fi

echo ""
read -p "👉 Enter your GitHub username: " username

if [ -z "$username" ]; then
    echo "❌ Username cannot be empty."
    exit 1
fi

# Set up remote
REPO_URL="git@github.com:$username/tweet-pattern-analyzer.git"
echo ""
echo "📡 Adding GitHub remote..."
echo "Repository: $REPO_URL"

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin "$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote added successfully"
else
    echo "❌ Failed to add remote. Please check the repository name."
    exit 1
fi

# Set default branch to main
git branch -M main

echo ""
echo "🚀 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo ""
    echo "📁 Repository: https://github.com/$username/tweet-pattern-analyzer"
    echo ""
    echo "⚠️  REMINDER: This is a PRIVATE repository"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add collaborators if needed: Repository Settings > Collaborators"
    echo "2. Set up branch protection: Repository Settings > Branches"
    echo "3. Configure GitHub Actions for CI/CD (optional)"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "1. SSH key not set up. Check: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    echo "2. Repository name mismatch"
    echo "3. No push permissions"
    echo ""
    echo "🔧 To use HTTPS instead of SSH, run:"
    echo "git remote set-url origin https://github.com/$username/tweet-pattern-analyzer.git"
    echo "git push -u origin main"
fi

