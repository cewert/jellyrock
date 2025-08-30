#!/usr/bin/env node

/**
 * Simplified Changelog Sync Manager
 * 
 * Keeps CHANGELOG.md automatically in sync with git state:
 * - Unreleased section tracks commits since latest tag
 * - Release sections are created when tags are pushed
 * - No manual intervention required
 */

import { execSync } from 'child_process';
import fs from 'fs';

class ChangelogSyncer {
  constructor() {
    this.changelogPath = 'CHANGELOG.md';
    this.repositoryUrl = 'https://github.com/cewert/jellyrock';
  }

  /**
   * Sync unreleased changes - called on push to main
   */
  syncUnreleased() {
    console.log('🔄 Syncing unreleased changes...');

    const latestTag = this.getLatestTag();
    const commits = this.getCommitsSince(latestTag);

    if (commits.length === 0) {
      console.log('ℹ️ No unreleased changes to sync');
      return;
    }

    console.log(`📊 Found ${commits.length} unreleased commits since ${latestTag || 'start'}`);

    const changelog = this.readChangelog();
    const updatedChangelog = this.updateUnreleasedSection(changelog, commits);

    fs.writeFileSync(this.changelogPath, updatedChangelog);
    console.log('✅ Unreleased section synced');
  }

  /**
   * Sync release - called when tag is created
   */
  syncRelease(version) {
    console.log(`🚀 Syncing release ${version}...`);

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid version format: ${version}. Expected: x.y.z`);
    }

    // Get previous tag to determine range - use HEAD instead of non-existent future tag
    const previousTag = this.getLatestTag();
    const commits = this.getCommitsSince(previousTag, 'HEAD');

    if (commits.length === 0) {
      console.log('⚠️ No commits found for release - creating minimal entry');
    }

    const changelog = this.readChangelog();
    const updatedChangelog = this.convertUnreleasedToRelease(changelog, version, commits);

    fs.writeFileSync(this.changelogPath, updatedChangelog);
    console.log(`✅ Release ${version} synced to changelog`);
  }

  /**
   * Get current status of changelog
   */
  getStatus() {
    const latestTag = this.getLatestTag();
    const commits = this.getCommitsSince(latestTag);
    const changelog = fs.readFileSync(this.changelogPath, 'utf8');

    const hasUnreleased = changelog.includes('## [Unreleased]');
    const versionEntries = (changelog.match(/## \[\d+\.\d+\.\d+\]/g) || []).length;

    console.log('📊 Changelog Status:');
    console.log(`  Latest tag: ${latestTag || 'none'}`);
    console.log(`  Unreleased commits: ${commits.length}`);
    console.log(`  Has unreleased section: ${hasUnreleased}`);
    console.log(`  Version entries: ${versionEntries}`);

    return {
      latestTag,
      unreleasedCommits: commits.length,
      hasUnreleased,
      versionEntries
    };
  }

  /**
   * Validate changelog consistency
   */
  validate() {
    console.log('🔍 Validating changelog consistency...');

    const status = this.getStatus();
    const issues = [];

    // Check file exists
    if (!fs.existsSync(this.changelogPath)) {
      issues.push('CHANGELOG.md file missing');
    }

    // Check unreleased section consistency
    if (status.unreleasedCommits > 0 && !status.hasUnreleased) {
      issues.push(`${status.unreleasedCommits} unreleased commits but no [Unreleased] section`);
    }

    if (status.unreleasedCommits === 0 && status.hasUnreleased) {
      // This is actually OK - unreleased section can exist even with no commits
      console.log('ℹ️ [Unreleased] section exists but no unreleased commits (this is fine)');
    }

    // Validate basic format
    const changelog = fs.readFileSync(this.changelogPath, 'utf8');
    if (!changelog.includes('# Changelog')) {
      issues.push('Missing changelog header');
    }

    if (!changelog.includes('Keep a Changelog')) {
      issues.push('Missing Keep a Changelog reference');
    }

    if (issues.length === 0) {
      console.log('✅ Changelog validation passed');
      return true;
    } else {
      console.log('❌ Changelog validation failed:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      return false;
    }
  }

  // Helper methods
  readChangelog() {
    if (!fs.existsSync(this.changelogPath)) {
      const header = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

`;
      fs.writeFileSync(this.changelogPath, header);
    }
    return fs.readFileSync(this.changelogPath, 'utf8');
  }

  updateUnreleasedSection(changelog, commits) {
    const sections = this.categorizeCommits(commits);
    const unreleasedContent = this.buildUnreleasedContent(sections);

    // More robust removal of unreleased section
    const lines = changelog.split('\n');
    const unreleasedStart = lines.findIndex(line => line.trim() === '## [Unreleased]');
    
    if (unreleasedStart === -1) {
      // No existing unreleased section, find insertion point after header
      const headerEndIndex = lines.findIndex((line, index) => 
        index > 5 && line.startsWith('## [') && line.match(/## \[\d+\.\d+\.\d+\]/));
      
      if (headerEndIndex === -1) {
        // No version sections, append to end
        return changelog + unreleasedContent;
      } else {
        // Insert before first version section
        lines.splice(headerEndIndex, 0, ...unreleasedContent.trim().split('\n'), '');
        return lines.join('\n');
      }
    }
    
    // Find the end of unreleased section (next version section or end of file)
    let unreleasedEnd = lines.length;
    for (let i = unreleasedStart + 1; i < lines.length; i++) {
      if (lines[i].match(/^## \[\d+\.\d+\.\d+\]/)) {
        unreleasedEnd = i;
        break;
      }
    }
    
    // Replace the unreleased section
    lines.splice(unreleasedStart, unreleasedEnd - unreleasedStart, ...unreleasedContent.trim().split('\n'), '');
    return lines.join('\n');
  }

  convertUnreleasedToRelease(changelog, version, commits) {
    const date = new Date().toISOString().split('T')[0];
    
    // Generate proper compare URL based on previous version
    const previousTag = this.getLatestTag();
    let compareUrl;
    
    if (previousTag) {
      // Use GitHub compare URL between previous tag and current version
      compareUrl = `${this.repositoryUrl}/compare/${previousTag}...v${version}`;
    } else {
      // First release, use tag URL as fallback
      compareUrl = `${this.repositoryUrl}/releases/tag/v${version}`;
    }

    // If we have unreleased section, convert it to release
    if (changelog.includes('## [Unreleased]')) {
      return changelog.replace(
        /## \[Unreleased\]/,
        `## [${version}](${compareUrl}) - ${date}`
      );
    } else {
      // No unreleased section, create new release entry
      const sections = this.categorizeCommits(commits);
      const releaseContent = this.buildReleaseContent(version, compareUrl, date, sections);

      // Insert after header
      const headerMatch = changelog.match(/(# Changelog\s*\n\nAll notable changes.*?\n\nThe format is based on.*?\n\n)/s);
      if (headerMatch) {
        const insertPoint = headerMatch.index + headerMatch[0].length;
        return changelog.slice(0, insertPoint) +
          releaseContent.substring(1) + // Remove leading newline
          changelog.slice(insertPoint);
      } else {
        // Fallback: insert after header
        const insertPoint = changelog.indexOf('\n\n') + 2;
        return changelog.slice(0, insertPoint) +
          releaseContent +
          changelog.slice(insertPoint);
      }
    }
  }

  categorizeCommits(commits) {
    const sections = {
      Added: [],
      Changed: [],
      Fixed: [],
      Removed: [],
      Security: [],
      Deprecated: [],
      Dependencies: []
    };

    for (const commit of commits) {
      // Check if this is a dependency-related PR
      let category = commit.isDependency ? 'Dependencies' : this.categorizeCommit(commit.message);
      
      if (category && category !== 'Chore') {
        const entry = this.formatCommitEntry(commit);
        sections[category].push(entry);
      }
    }

    return sections;
  }

  categorizeCommit(message) {
    const msg = message.toLowerCase();

    // Security first (highest priority)
    if (msg.includes('security') || msg.includes('vulnerability') || msg.includes('cve-')) {
      return 'Security';
    }

    // Check prefixes first (most specific)
    // Changes
    if (msg.startsWith('update') || msg.startsWith('change') || msg.startsWith('improve') ||
      msg.startsWith('refactor') || msg.startsWith('enhance')) {
      return 'Changed';
    }

    // Additions
    if (msg.startsWith('add') || msg.startsWith('feat') || msg.startsWith('implement') ||
      msg.startsWith('create')) {
      return 'Added';
    }

    // Fixes
    if (msg.startsWith('fix')) {
      return 'Fixed';
    }

    // Removals
    if (msg.startsWith('remove') || msg.startsWith('delete')) {
      return 'Removed';
    }

    // Skip chores
    if (msg.startsWith('chore') || msg.startsWith('ci') || msg.startsWith('build') ||
      msg.startsWith('docs') || msg.startsWith('style') || msg.startsWith('test')) {
      return 'Chore';
    }

    // Then check content-based matches (less specific)
    if (msg.includes('deprecate') || msg.includes('deprecated')) {
      return 'Deprecated';
    }

    if (msg.includes('removed')) {
      return 'Removed';
    }

    if (msg.includes('fixes') || msg.includes('fixed') ||
      msg.includes('resolve') || msg.includes('correct')) {
      return 'Fixed';
    }

    // Only match "new" if it's at the beginning of a word or after common prefixes
    if (msg.includes('new ') || msg.includes('create')) {
      return 'Added';
    }

    // Default to Changed
    return 'Changed';
  }

  formatCommitEntry(commit) {
    const cleanMessage = this.cleanMessage(commit.message);
    
    // Only show commit link if there's no PR, otherwise show PR link
    if (commit.prNumber) {
      const prLink = `([#${commit.prNumber}](${this.repositoryUrl}/pull/${commit.prNumber}))`;
      return `- ${cleanMessage} ${prLink}`;
    } else {
      const commitLink = `([${commit.hash.substring(0, 7)}](${this.repositoryUrl}/commit/${commit.hash}))`;
      return `- ${cleanMessage} ${commitLink}`;
    }
  }

  cleanMessage(message) {
    // Remove conventional commit prefixes and action words
    let clean = message
      .replace(/^(feat|fix|docs|style|refactor|test|chore|build|ci)(\([^)]*\))?:\s*/i, '')
      .replace(/^(add|remove|update|change|improve|implement|create|delete|fix)\s*(\([^)]*\))?\s*:?\s*/i, '');

    // Remove action words from the start of the message using word boundaries
    clean = clean.replace(/^(add|remove|update|change|improve|implement|create|delete|fix)\b\s*/i, '');

    return clean;
  }

  buildUnreleasedContent(sections) {
    let content = '\n## [Unreleased]\n';

    // Define the order of sections to maintain consistency
    const sectionOrder = ['Added', 'Changed', 'Fixed', 'Removed', 'Security', 'Deprecated', 'Dependencies'];

    for (const sectionName of sectionOrder) {
      const items = sections[sectionName];
      if (items && items.length > 0) {
        content += `\n### ${sectionName}\n\n`;
        content += items.join('\n') + '\n';
      }
    }

    return content;
  }

  buildReleaseContent(version, compareUrl, date, sections) {
    let content = `\n## [${version}](${compareUrl}) - ${date}\n`;

    // Define the order of sections to maintain consistency
    const sectionOrder = ['Added', 'Changed', 'Fixed', 'Removed', 'Security', 'Deprecated', 'Dependencies'];

    for (const sectionName of sectionOrder) {
      const items = sections[sectionName];
      if (items && items.length > 0) {
        content += `\n### ${sectionName}\n\n`;
        content += items.join('\n') + '\n';
      }
    }

    return content;
  }

  getLatestTag() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  }

  getPreviousTag(currentTag) {
    try {
      const allTags = execSync('git tag --sort=-v:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.match(/^v\d+\.\d+\.\d+$/));

      const currentIndex = allTags.indexOf(currentTag);
      if (currentIndex === -1 || currentIndex === allTags.length - 1) {
        return null; // First release or tag not found
      }

      return allTags[currentIndex + 1];
    } catch {
      return null;
    }
  }

  getCommitsSince(fromTag, toTag = 'HEAD') {
    try {
      const range = fromTag ? `${fromTag}..${toTag}` : toTag;
      const gitLog = execSync(
        `git log ${range} --oneline --first-parent`,
        { encoding: 'utf8' }
      ).trim();

      if (!gitLog) return [];

      return gitLog.split('\n').map(line => {
        // Parse PR merges
        const mergeMatch = line.match(/^([a-f0-9]+)\s+Merge pull request #(\d+) from .+$/);
        if (mergeMatch) {
          try {
            const prInfo = execSync(
              `gh pr view ${mergeMatch[2]} --json title,labels --jq '{title, labels: [.labels[].name]}'`,
              { encoding: 'utf8', stdio: 'pipe' }
            ).trim();
            const parsed = JSON.parse(prInfo);
            const isDependency = parsed.labels && parsed.labels.some(label => 
              label.toLowerCase().includes('depend') || label.toLowerCase().includes('deps')
            );
            
            return {
              hash: mergeMatch[1],
              message: parsed.title || `Merged PR #${mergeMatch[2]}`,
              prNumber: mergeMatch[2],
              isDependency: isDependency
            };
          } catch (error) {
            console.log(`⚠️ Failed to get PR info for #${mergeMatch[2]}: ${error.message}`);
            return {
              hash: mergeMatch[1],
              message: `Merged PR #${mergeMatch[2]}`,
              prNumber: mergeMatch[2],
              isDependency: false
            };
          }
        }

        // Parse regular commits
        const prMatch = line.match(/\(#(\d+)\)$/);
        const prNumber = prMatch ? prMatch[1] : null;
        const message = prMatch ? line.replace(/\s*\(#\d+\)$/, '') : line;
        const [hash, ...messageParts] = message.split(' ');

        let isDependency = false;
        if (prNumber) {
          try {
            const prInfo = execSync(
              `gh pr view ${prNumber} --json labels --jq '{labels: [.labels[].name]}'`,
              { encoding: 'utf8', stdio: 'pipe' }
            ).trim();
            const parsed = JSON.parse(prInfo);
            isDependency = parsed.labels && parsed.labels.some(label => 
              label.toLowerCase().includes('depend') || label.toLowerCase().includes('deps')
            );
          } catch (error) {
            // If we can't get PR info, assume not a dependency
            console.log(`⚠️ Failed to get PR info for #${prNumber}: ${error.message}`);
            isDependency = false;
          }
        }

        return {
          hash: hash,
          message: messageParts.join(' ').trim(),
          prNumber: prNumber,
          isDependency: isDependency
        };
      }).filter(commit => {
        // Filter out automated commits
        const msg = commit.message.toLowerCase();
        return !msg.match(/^(bump version|release v|version bump|docs: sync changelog|docs: update changelog)/) &&
          !msg.includes('update en_us translation file') &&
          !msg.includes('en_us translation file') &&
          !msg.includes('update api docs') &&
          commit.message.length > 0;
      });
    } catch (error) {
      console.error('❌ Error getting commits:', error.message);
      return [];
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const syncer = new ChangelogSyncer();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'sync-unreleased':
        syncer.syncUnreleased();
        break;

      case 'sync-release':
        const version = process.argv[3];
        if (!version) {
          console.error('❌ Version required for sync-release');
          process.exit(1);
        }
        syncer.syncRelease(version);
        break;

      case 'status':
        syncer.getStatus();
        break;

      case 'validate':
        const isValid = syncer.validate();
        process.exit(isValid ? 0 : 1);
        break;

      default:
        console.log(`
📖 Changelog Syncer

Commands:
  sync-unreleased     Sync unreleased changes from commits
  sync-release <ver>  Convert unreleased to release version
  status              Show current changelog status  
  validate            Validate changelog consistency
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export { ChangelogSyncer };
