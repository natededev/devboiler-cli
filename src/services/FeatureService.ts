import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { PackageManagerService } from './PackageManagerService.js';
import type { PackageManager, FeatureFlags } from '../types/index.js';

/**
 * Feature configuration for progressive enhancement
 */
interface FeatureConfig {
  name: string;
  packages: string[];
  devPackages: string[];
  files: Record<string, string>;
}

/**
 * Base64-encoded DevBoiler SVG logo for use as a favicon data URI.
 */
const FAVICON_DATA_URI =
  'data:image/svg+xml;base64,' +
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQyNS44NSAzMzguMDkiPgo8cG9seWdvbiBmaWxsPSIjQTlBNkExIiBwb2ludHM9IjQyNS41OSwzMDQuMDEgNDI1LjU5LDMzNy44NSAyNzIuNDEsMzIwLjIxIDM5OC4yNywzMDQuMDEiLz4KPHBvbHlnb24gZmlsbD0iI0FFQURBOCIgcG9pbnRzPSI0MjUuNTksODkuNiA0MjUuNTksMjgwLjAxIDQwNy42NywxODQuODgiLz4KPHBvbHlnb24gZmlsbD0iI0Y1RjZGMEIgcG9pbnRzPSI0MjUuNTksODkuNiA0MDcuNjcsMTg0Ljg4IDM4OS43NCw5NS45NyIvPgo8cG9seWdvbiBmaWxsPSIjN0Q3Qzc4IiBwb2ludHM9IjQwNy42NywxODQuODggNDI1LjU5LDI4MC4wMSAzODkuNzQsMjcyLjc4Ii8+Cjxwb2x5Z29uIGZpbGw9IiNFN0U2RTEiIHBvaW50cz0iNDI1LjU5LDg5LjYgMzg5Ljc0LDk1Ljk3IDM5Ni41Myw2My40NCIvPgo8cG9seWdvbiBmaWxsPSIjNDk0QTQ1IiBwb2ludHM9IjQyNS41OSwyODAuMDEgMzk4LjI3LDMwNC4wMSAzODkuNzQsMjcyLjc4Ii8+Cjxwb2x5Z29uIGZpbGw9IiMzMjM0MkYiIHBvaW50cz0iNDI1LjU5LDMzNy44NSAxMjAuMzksMzM3Ljg1IDI3Mi40MSwzMjAuMjEiLz4KPHBvbHlnb24gZmlsbD0iIzQ3NUU0QSIgcG9pbnRzPSIzODkuNzQsOTUuOTcgNDA3LjY3LDE4NC44OCAzODkuNzQsMjcyLjc4Ii8+Cjxwb2x5Z29uIGZpbGw9IiM3MDZGNkEiIHBvaW50cz0iMzg5Ljc0LDI3Mi43OCAzOTguMjcsMzA0LjAxIDI3My43OSwyODguNTQiLz4KPHBvbHlnb24gZmlsbD0iI0E4QUFBNSIgcG9pbnRzPSIzOTguMjcsMzA0LjAxIDI3Mi40MSwzMjAuMjEgMTQ2LjU2LDMwNC4wMSIvPgo8cG9seWdvbiBmaWxsPSIjRkFGREY2IiBwb2ludHM9IjM5Ni41Myw2My40NCAzODkuNzQsOTUuOTcgMjcyLjYzLDc5LjM0Ii8+Cjxwb2x5Z29uIGZpbGw9IiNERERFRDgiIHBvaW50cz0iMzk2LjUzLDYzLjQ0IDI3Mi42Myw3OS4zNCAyNzIuNjEsNzkuMzQgMTQ4LjU4LDYzLjQ0Ii8+Cjxwb2x5Z29uIGZpbGw9IiM3RTdGNzkiIHBvaW50cz0iMzk2LjUzLDYzLjQ0IDE0OC41OCw2My40NCAyNzIuNjMsMzQuMjMiLz4KPHBvbHlnb24gZmlsbD0iI0VFRjFFQSIgcG9pbnRzPSIzOTYuNTMsNjMuNDQgMjcyLjYzLDM0LjIzIDI4NS45MywzNC4yMyAyOTYuNDksMzQuMjMgMzUzLjMxLDM0LjIzIi8+Cjxwb2x5Z29uIGZpbGw9IiNCM0IyQUUiIHBvaW50cz0iMzg5Ljc0LDk1Ljk3IDM4OS43NCwyNzIuNzggMjcyLjkyLDE4My4xNSIvPgo8cG9seWdvbiBmaWxsPSIjRDJEM0NEIiBwb2ludHM9IjM4OS43NCw5NS45NyAyNzIuOTIsMTgzLjE1IDI3Mi41Niw5NS45NyIvPgo8cG9seWdvbiBmaWxsPSIjMzQ2MjNEIiBwb2ludHM9IjM4OS43NCw5NS45NyAyNzIuNTYsOTUuOTcgMTU3LjI2LDk1Ljk3IDI3Mi42MSw3OS4zNCAyNzIuNjMsNzkuMzQiLz4KPHBvbHlnb24gZmlsbD0iI0QzREVDRCIgcG9pbnRzPSIzODkuNzQsMjcyLjc4IDI3My43OSwyODguNTQgMTU2LjEsMjcyLjc4Ii8+Cjxwb2x5Z29uIGZpbGw9IiM2MTc0NjAiIHBvaW50cz0iMzg5Ljc0LDI3Mi43OCAxNTYuMSwyNzIuNzggMjcyLjkyLDE4My4xNSIvPgo8cG9seWdvbiBmaWxsPSIjOUM5RDk3IiBwb2ludHM9IjMwNS43NCwxMC4yMyAyOTYuNDksMzQuMjMgMjg1LjkzLDM0LjIzIDI5My4wMiwxMC4yMyIvPgo8cG9seWdvbiBmaWxsPSIjRTZFNUUwIiBwb2ludHM9IjMwNS43NCwxMC4yMyAyOTMuMDIsMTAuMjMgMjg0LjIsMC4yNSAyOTUuNjIsMC4yNSIvPgo8cG9seWdvbiBmaWxsPSIjQ0FDQkM1IiBwb2ludHM9IjI4NC4yLDAuMjUgMjkzLjAyLDEwLjIzIDI1Mi4yNSwxMC4yMyAyNzguMjcsMC4yNSIvPgo8cG9seWdvbiBmaWxsPSIjNUI1QzU3IiBwb2ludHM9IjI5My4wMiwxMC4yMyAyODUuOTMsMzQuMjMgMjcyLjYzLDM0LjIzIDI1OC4xNywzNC4yMyAyNTIuMjUsMTAuMjMiLz4KPHBvbHlnb24gZmlsbD0iI0IwQUZBQiIgcG9pbnRzPSIyNzguMjcsMC4yNSAyNTIuMjUsMTAuMjMgMjUyLjI1LDAuMjUiLz4KPHBvbHlnb24gZmlsbD0iIzNCM0QzOCIgcG9pbnRzPSIyNzMuNzksMjg4LjU0IDE0Ni41NiwzMDQuMDEgMTU2LjEsMjcyLjc4Ii8+Cjxwb2x5Z29uIGZpbGw9IiMxRjJBMjQiIHBvaW50cz0iMjcyLjU2LDk1Ljk3IDI3Mi45MiwxODMuMTUgMTU2LjY4LDE4My43MiAxNTcuMjYsOTUuOTciLz4KPHBvbHlnb24gZmlsbD0iIzcxN0I3MCIgcG9pbnRzPSIyNzIuOTIsMTgzLjE1IDE1Ni4xLDI3Mi43OCAxNTYuNjgsMTgzLjcyIi8+Cjxwb2x5Z29uIGZpbGw9IiM5NTk2OTEiIHBvaW50cz0iMjcyLjYzLDM0LjIzIDE0OC41OCw2My40NCAxOTMuODQsMzQuMjMgMjUwLjUxLDM0LjIzIDI1OC4xNywzNC4yMyIvPgo8cG9seWdvbiBmaWxsPSIjQjFCMEFCIiBwb2ludHM9IjI3Mi42MSw3OS4zNCAxNTcuMjYsOTUuOTcgMTQ4LjU4LDYzLjQ0Ii8+Cjxwb2x5Z29uIGZpbGw9IiM2MzYyNjAiIHBvaW50cz0iMjcyLjQxLDMyMC4yMSAxMjAuMzksMzM3Ljg1IDExOS44MSwzMDQuMDEgMTQ2LjU2LDMwNC4wMSIvPgo8cG9seWdvbiBmaWxsPSIjNzc3QTczIiBwb2ludHM9IjI1Mi4yNSwxMC4yMyAyNTguMTcsMzQuMjMgMjUwLjUxLDM0LjIzIDI0MC41MywxMC4yMyIvPgo8cmVjdCB4PSIyMTkuNDMiIHk9IjE1Ni4xMSIgZmlsbD0iIzhGRkM4OSIgd2lkdGg9IjM4LjAyIiBoZWlnaHQ9IjguMjQiLz4KPHBvbHlnb24gZmlsbD0iIzY1NkE2NiIgcG9pbnRzPSIyNTIuMjUsMC4yNSAyNTIuMjUsMTAuMjMgMjQwLjUzLDEwLjIzIi8+Cjxwb2x5Z29uIGZpbGw9IiM4RkZDODkiIHBvaW50cz0iMjExLjYyLDEzMi44MyAyMTEuNjIsMTQxLjM2IDE3Ny41LDE2MS40NiAxNzcuNSwxNTAuNzYgMjAwLjQ5LDEzNy4zMiAxNzcuNSwxMjQuODggMTc3LjUsMTE0LjkxIi8+Cjxwb2x5Z29uIGZpbGw9IiM3NTc1NzMiIHBvaW50cz0iMTQ4LjU4LDYzLjQ0IDE1Ny4yNiw5NS45NyAxMjAuMzksOTAuNjIiLz4KPHBvbHlnb24gZmlsbD0iI0FCRDZBOSIgcG9pbnRzPSIxNTcuMjYsOTUuOTcgMTU2LjY4LDE4My43MiAxNTYuMSwyNzIuNzggMTM3LjQ1LDE4Mi43MSIvPgo8cG9seWdvbiBmaWxsPSIjNjk2QjY2IiBwb2ludHM9IjE1Ny4yNiw5NS45NyAxMzcuNDUsMTgyLjcxIDEyMC4zOSw5MC42MiIvPgo8cG9seWdvbiBmaWxsPSIjM0EzQTNBIiBwb2ludHM9IjEzNy40NSwxODIuNzEgMTU2LjEsMjcyLjc4IDEyMC4zOSwyNzguMjgiLz4KPHBvbHlnb24gZmlsbD0iIzVDNUM1QSIgcG9pbnRzPSIxNTYuMSwyNzIuNzggMTQ2LjU2LDMwNC4wMSAxMjAuMzksMjc4LjI4Ii8+Cjxwb2x5Z29uIGZpbGw9IiNBQ0FEQTciIHBvaW50cz0iMTIwLjM5LDkwLjYyIDEzNy40NSwxODIuNzEgMTIwLjM5LDI3OC4yOCAxMjAuMzksMTk3LjAzIDEyMC4zOSwxNTAuNzYgMTIwLjM5LDE0NC42OSIvPgo8cG9seWdvbiBmaWxsPSIjNEI0QjQ5IiBwb2ludHM9IjEyMC4zOSwxOTcuMDMgMTIwLjM5LDI2My41MyA5MC4xNywxODIuNTciLz4KPHBvbHlnb24gZmlsbD0iIzc4Nzg3NiIgcG9pbnRzPSIxMjAuMzksMTUwLjc2IDEyMC4zOSwxOTcuMDMgOTAuMTcsMTgyLjU3Ii8+Cjxwb2x5Z29uIGZpbGw9IiNDMUMyQkMiIHBvaW50cz0iMTIwLjM5LDE0NC42OSAxMjAuMzksMTUwLjc2IDkwLjE3LDE4Mi41NyA0NC43OCw4Mi4zOCA1Ni43OCw4Mi4zOCAxMTAuNywxNDQuNjkiLz4KPHBvbHlnb24gZmlsbD0iIzQwNDA0MCIgcG9pbnRzPSI5MC4xNywxODIuNTcgMTIwLjM5LDI2My41MyA2Mi44NSwyMTkuMTUiLz4KPHBvbHlnb24gZmlsbD0iIzdBODA4MCIgcG9pbnRzPSI0NC43OCw4Mi4zOCA5MC4xNywxODIuNTcgMzUuNTIsMTI0LjQ1Ii8+Cjxwb2x5Z29uIGZpbGw9IiM2NjY3NkIiIHBvaW50cz0iMzUuNTIsMTI0LjQ1IDkwLjE3LDE4Mi41NyA2Mi44NSwyMTkuMTUiLz4KPHBvbHlnb24gZmlsbD0iIzYwNjM1QyIgcG9pbnRzPSI0NC43OCw4Mi4zOCAzNS41MiwxMjQuNDUgMC4yNSw4Mi4zOCIvPgo8L3N2Zz4=';

/**
 * Inline SVG markup for the DevBoiler logo, suitable for embedding in JSX.
 * All fill classes have been resolved to inline fill attributes.
 */
const SVG_LOGO_MARKUP = `<svg viewBox="0 0 425.85 338.09" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="#A9A6A1" points="425.59,304.01 425.59,337.85 272.41,320.21 398.27,304.01" />
    <polygon fill="#AEADA8" points="425.59,89.6 425.59,280.01 407.67,184.88" />
    <polygon fill="#F5F6F0" points="425.59,89.6 407.67,184.88 389.74,95.97" />
    <polygon fill="#7D7C78" points="407.67,184.88 425.59,280.01 389.74,272.78" />
    <polygon fill="#E7E6E1" points="425.59,89.6 389.74,95.97 396.53,63.44" />
    <polygon fill="#494A45" points="425.59,280.01 398.27,304.01 389.74,272.78" />
    <polygon fill="#32342F" points="425.59,337.85 120.39,337.85 272.41,320.21" />
    <polygon fill="#475E4A" points="389.74,95.97 407.67,184.88 389.74,272.78" />
    <polygon fill="#706F6A" points="389.74,272.78 398.27,304.01 273.79,288.54" />
    <polygon fill="#A8AAA5" points="398.27,304.01 272.41,320.21 146.56,304.01" />
    <polygon fill="#FAFDF6" points="396.53,63.44 389.74,95.97 272.63,79.34" />
    <polygon fill="#DDDED8" points="396.53,63.44 272.63,79.34 272.61,79.34 148.58,63.44" />
    <polygon fill="#7E7F79" points="396.53,63.44 148.58,63.44 272.63,34.23" />
    <polygon fill="#EEF1EA" points="396.53,63.44 272.63,34.23 285.93,34.23 296.49,34.23 353.31,34.23" />
    <polygon fill="#B3B2AE" points="389.74,95.97 389.74,272.78 272.92,183.15" />
    <polygon fill="#D2D3CD" points="389.74,95.97 272.92,183.15 272.56,95.97" />
    <polygon fill="#34623D" points="389.74,95.97 272.56,95.97 157.26,95.97 272.61,79.34 272.63,79.34" />
    <polygon fill="#D3DECD" points="389.74,272.78 273.79,288.54 156.1,272.78" />
    <polygon fill="#617460" points="389.74,272.78 156.1,272.78 272.92,183.15" />
    <polygon fill="#9C9D97" points="305.74,10.23 296.49,34.23 285.93,34.23 293.02,10.23" />
    <polygon fill="#E6E5E0" points="305.74,10.23 293.02,10.23 284.2,0.25 295.62,0.25" />
    <polygon fill="#CACBC5" points="284.2,0.25 293.02,10.23 252.25,10.23 278.27,0.25" />
    <polygon fill="#5B5C57" points="293.02,10.23 285.93,34.23 272.63,34.23 258.17,34.23 252.25,10.23" />
    <polygon fill="#B0AFAB" points="278.27,0.25 252.25,10.23 252.25,0.25" />
    <polygon fill="#3B3D38" points="273.79,288.54 146.56,304.01 156.1,272.78" />
    <path fill="#1F2A24" d="M272.56,95.97l0.36,87.18l-116.24,0.57l0.58-87.75H272.56z M257.45,164.35v-8.24h-38.02v8.24H257.45z M211.62,141.36v-8.53l-34.12-17.92v9.97l22.99,12.44l-22.99,13.44v10.7L211.62,141.36z" />
    <polygon fill="#717B70" points="272.92,183.15 156.1,272.78 156.68,183.72" />
    <polygon fill="#959691" points="272.63,34.23 148.58,63.44 193.84,34.23 250.51,34.23 258.17,34.23" />
    <polygon fill="#B1B0AB" points="272.61,79.34 157.26,95.97 148.58,63.44" />
    <polygon fill="#636260" points="272.41,320.21 120.39,337.85 119.81,304.01 146.56,304.01" />
    <polygon fill="#777A73" points="252.25,10.23 258.17,34.23 250.51,34.23 240.53,10.23" />
    <rect x="219.43" y="156.11" fill="#8FFC89" width="38.02" height="8.24" />
    <polygon fill="#656A66" points="252.25,0.25 252.25,10.23 240.53,10.23" />
    <polygon fill="#8FFC89" points="211.62,132.83 211.62,141.36 177.5,161.46 177.5,150.76 200.49,137.32 177.5,124.88 177.5,114.91" />
    <polygon fill="#757573" points="148.58,63.44 157.26,95.97 120.39,90.62" />
    <polygon fill="#ABD6A9" points="157.26,95.97 156.68,183.72 156.1,272.78 137.45,182.71" />
    <polygon fill="#696B66" points="157.26,95.97 137.45,182.71 120.39,90.62" />
    <polygon fill="#3A3A3A" points="137.45,182.71 156.1,272.78 120.39,278.28" />
    <polygon fill="#5C5C5A" points="156.1,272.78 146.56,304.01 120.39,278.28" />
    <polygon fill="#ACADA7" points="120.39,90.62 137.45,182.71 120.39,278.28 120.39,263.53 120.39,197.03 120.39,150.76 120.39,144.69" />
    <polygon fill="#4B4B49" points="120.39,197.03 120.39,263.53 90.17,182.57" />
    <polygon fill="#787876" points="120.39,150.76 120.39,197.03 90.17,182.57" />
    <polygon fill="#C1C2BC" points="120.39,144.69 120.39,150.76 90.17,182.57 44.78,82.38 56.78,82.38 110.7,144.69" />
    <polygon fill="#404040" points="90.17,182.57 120.39,263.53 62.85,219.15" />
    <polygon fill="#7A8080" points="44.78,82.38 90.17,182.57 35.52,124.45" />
    <polygon fill="#66676B" points="35.52,124.45 90.17,182.57 62.85,219.15" />
    <polygon fill="#60635C" points="44.78,82.38 35.52,124.45 0.25,82.38" />
  </svg>`;

/**
 * Service for adding features to a scaffolded Vite project
 * Handles Tailwind CSS, Zustand, React Router, and ESLint/Prettier
 * Also provides base template cleanup for a zero-bloat starting point
 */
export class FeatureService {
  private readonly projectPath: string;
  private readonly packageManager: PackageManager;
  private readonly packageManagerService: PackageManagerService;
  private readonly projectName: string;

  constructor(
    projectPath: string,
    packageManager: PackageManager = 'npm',
    projectName?: string
  ) {
    this.projectPath = projectPath;
    this.packageManager = packageManager;
    this.packageManagerService = new PackageManagerService(packageManager);
    this.projectName = projectName || path.basename(projectPath);
  }

  /**
   * Clean up the base Vite template to provide a zero-bloat starting point
   * Removes default styling, strips App.tsx to a minimal component,
   * replaces the Vite favicon with DevBoiler's logo, and updates the title.
   */
  async cleanupBaseTemplate(): Promise<void> {
    logger.info('Cleaning up base template...');

    // Delete src/App.css (default Vite styling)
    const appCssPath = path.join(this.projectPath, 'src', 'App.css');
    if (await fs.pathExists(appCssPath)) {
      await fs.remove(appCssPath);
    }

    // Clear src/index.css (remove default Vite styles)
    const indexCssPath = path.join(this.projectPath, 'src', 'index.css');
    await fs.writeFile(indexCssPath, '');

    // Strip src/App.tsx to a clean, minimal component
    const appTsxPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appTsxPath, this.getMinimalApp());

    // Replace favicon and title in index.html
    const indexPath = path.join(this.projectPath, 'index.html');
    if (await fs.pathExists(indexPath)) {
      let html = await fs.readFile(indexPath, 'utf-8');

      // Remove default Vite favicon link (href="/vite.svg" or href="/favicon.svg")
      html = html.replace(
        /<link[^>]*rel="icon"[^>]*\/?\s*>/i,
        ''
      );

      // Inject DevBoiler favicon as data URI
      html = html.replace(
        '</head>',
        `  <link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}" />\n  </head>`
      );

      // Replace <title> content: "Vite + React" or any existing title
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>DevBoiler | ${this.projectName}</title>`
      );

      await fs.writeFile(indexPath, html);
    }

    logger.success('Base template cleaned up');
  }

  /**
   * Configure absolute path aliases (@ prefix pointing to src/)
   * Modifies tsconfig.json and vite.config.ts
   */
  async configurePathAliases(): Promise<void> {
    logger.info('Configuring path aliases...');

    // Update tsconfig.json
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    if (await fs.pathExists(tsconfigPath)) {
      const tsconfig = await fs.readJSON(tsconfigPath);
      
      // Ensure compilerOptions exists
      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }
      
      // Add path aliases
      tsconfig.compilerOptions.paths = {
        '@/*': ['./src/*']
      };
      
      // Ensure baseUrl is set
      tsconfig.compilerOptions.baseUrl = '.';

      await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });
    }

    // Update vite.config.ts
    // Note: vite.config.ts runs in ESM mode where __dirname is not available.
    // We use '/src' as a relative path which Vite resolves to the project root's /src directory.
    const viteConfigPath = path.join(this.projectPath, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
      const viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
      
      // If resolve.alias is already configured, skip
      if (viteConfig.includes('resolve:')) {
        logger.success('Path aliases already configured in vite.config.ts');
        return;
      }
      
      // Replace the defineConfig content to add resolve.alias
      // '/src' is relative to the project root which is what Vite uses as the base
      const updatedConfig = viteConfig.replace(
        /plugins: \[react\(\)\]/,
        `resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [react()]`
      );

      await fs.writeFile(viteConfigPath, updatedConfig);
    }

    logger.success('Path aliases configured');
  }

  /**
   * Feature configurations with package dependencies and file contents
   */
  private getFeatureConfigs(): Record<string, FeatureConfig> {
    return {
      tailwind: {
        name: 'Tailwind CSS',
        packages: ['tailwindcss', '@tailwindcss/postcss', 'autoprefixer'],
        devPackages: [],
        files: {
          'tailwind.config.js': this.getTailwindConfig(),
          'postcss.config.js': this.getPostCssConfig(),
          'src/index.css': this.getTailwindCss(),
        },
      },
      zustand: {
        name: 'Zustand',
        packages: ['zustand'],
        devPackages: [],
        files: {
          'src/store/counterStore.ts': this.getCounterStore(),
        },
      },
      'react-router': {
        name: 'React Router',
        packages: ['react-router-dom'],
        devPackages: [],
        files: {
          'src/App.tsx': '',
        },
      },
      'eslint-prettier': {
        name: 'ESLint & Prettier',
        packages: [],
        devPackages: [
          'eslint',
          'prettier',
          'eslint-config-prettier',
          'eslint-plugin-prettier',
          '@types/eslint',
        ],
        files: {
          '.eslintrc.cjs': this.getEslintConfig(),
          '.prettierrc': this.getPrettierConfig(),
          '.eslintignore': this.getEslintIgnore(),
        },
      },
    };
  }

  /**
   * Add Tailwind CSS to the project
   */
  async addTailwind(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs.tailwind;
    if (!config) throw new Error('Tailwind config not found');
    
    logger.info('Adding Tailwind CSS...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Write config files
    await this.writeFile('tailwind.config.js', config.files['tailwind.config.js']!);
    await this.writeFile('postcss.config.js', config.files['postcss.config.js']!);

    // Update src/index.css with Tailwind directives
    const cssPath = path.join(this.projectPath, 'src', 'index.css');
    await fs.writeFile(cssPath, config.files['src/index.css']!);

    logger.success('Tailwind CSS added successfully');
  }

  /**
   * Add Zustand to the project
   */
  async addZustand(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs.zustand;
    if (!config) throw new Error('Zustand config not found');
    
    logger.info('Adding Zustand...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Create store directory and file
    const storeDir = path.join(this.projectPath, 'src', 'store');
    await fs.ensureDir(storeDir);
    await this.writeFile(path.join('src', 'store', 'counterStore.ts'), config.files['src/store/counterStore.ts']!);

    logger.success('Zustand added successfully');
  }

  /**
   * Add React Router to the project
   * Writes a dashboard-style App.tsx showing active features
   */
  async addReactRouter(features: FeatureFlags): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['react-router'];
    if (!config) throw new Error('React Router config not found');
    
    logger.info('Adding React Router...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Replace App.tsx with dashboard layout
    const appPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appPath, this.getReactRouterApp(features));

    logger.success('React Router added successfully');
  }

  /**
   * Add React Router with Zustand integration
   * Creates a composable multi-page dashboard with a global counter
   * demonstrating state persistence across routes
   */
  async addReactRouterWithZustand(features: FeatureFlags): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['react-router'];
    if (!config) throw new Error('React Router config not found');
    
    logger.info('Adding React Router with Zustand integration...');

    // Install packages (Zustand should already be installed)
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Replace App.tsx with composable dashboard layout
    const appPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appPath, this.getComposableAppLayout(features));

    logger.success('React Router with Zustand integration added successfully');
  }

  /**
   * Add ESLint and Prettier to the project
   */
  async addEslintPrettier(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['eslint-prettier'];
    if (!config) throw new Error('ESLint & Prettier config not found');
    
    logger.info('Adding ESLint & Prettier...');

    // Install dev packages
    await this.packageManagerService.addPackages(
      config.devPackages,
      this.projectPath,
      true
    );

    // Write config files
    await this.writeFile('.eslintrc.cjs', config.files['.eslintrc.cjs']!);
    await this.writeFile('.prettierrc', config.files['.prettierrc']!);
    await this.writeFile('.eslintignore', config.files['.eslintignore']!);

    logger.success('ESLint & Prettier added successfully');
  }

  /**
   * Write a file to the project directory
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.projectPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }

  // ==================== Snippet Generators ====================

  /**
   * Return conditional Tailwind CSS class names or fallback inline styles.
   * When Tailwind is enabled, elements use className with utility classes.
   * When Tailwind is disabled, a clean classless fallback is used.
   */
  private getCss(features: FeatureFlags): Record<string, string> {
    const tw = features.addTailwind;

    return {
      // App shell — dark modern canvas
      appShell: tw
        ? 'bg-zinc-950 text-zinc-50 min-h-screen font-sans antialiased'
        : '',

      // Navigation bar
      nav: tw
        ? 'border-b border-zinc-800 px-6 py-4 flex items-center gap-6'
        : '',
      
      // Navigation links
      navLink: tw
        ? 'text-zinc-400 hover:text-zinc-100 transition-colors no-underline text-sm font-medium'
        : '',

      // Dashboard content wrapper
      dashboard: tw
        ? 'max-w-3xl mx-auto px-6 py-16'
        : '',

      // Architecture page wrapper
      architecture: tw
        ? 'max-w-3xl mx-auto px-6 py-16'
        : '',

      // H1 heading
      h1: tw
        ? 'text-4xl font-bold tracking-tight mb-2'
        : '',

      // Subtitle / lead paragraph
      lead: tw
        ? 'text-zinc-400 text-lg leading-relaxed'
        : '',

      // Section heading (h2)
      h2: tw
        ? 'text-lg font-semibold text-zinc-200 mt-10 mb-4'
        : '',

      // Feature badges list container
      badgeList: tw
        ? 'list-none p-0 flex flex-wrap gap-2'
        : '',

      // Individual feature badge pill
      badgeItem: tw
        ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium'
        : '',

      // Section paragraph body
      body: tw
        ? 'text-zinc-400 leading-relaxed'
        : '',

      // Tip / footnote text
      tip: tw
        ? 'text-sm text-zinc-500 mt-6'
        : '',

      // Counter value display
      counterValue: tw
        ? 'text-2xl font-bold text-zinc-50 my-2'
        : '',

      // Button group container
      buttonGroup: tw
        ? 'flex items-center gap-3 mt-4'
        : '',

      // Action button
      button: tw
        ? 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 transition-colors cursor-pointer'
        : '',

      // Footer
      footer: tw
        ? 'border-t border-zinc-800 px-6 py-6 flex items-center justify-center gap-2 text-xs text-zinc-600'
        : '',

      // Footer logo
      footerLogo: tw
        ? 'w-5 h-5'
        : '',
    };
  }

  /**
   * Build a bullet list of active feature badges
   */
  private getFeatureBadges(features: FeatureFlags): string {
    const css = this.getCss(features);
    const badges: string[] = [];

    const wrap = (text: string): string => {
      if (features.addTailwind) {
        return `      <li className="${css.badgeItem}">${text}</li>`;
      }
      return `      <li>${text}</li>`;
    };

    badges.push(wrap('React Router — Client-side routing active'));
    badges.push(wrap('Path Aliases — @/ import shortcuts configured'));

    if (features.addTailwind) {
      badges.push(wrap('Tailwind CSS v4 — Utility-first CSS ready'));
    }
    if (features.addZustand) {
      badges.push(wrap('Zustand — Global state management active'));
    }
    if (features.addEslintPrettier) {
      badges.push(wrap('ESLint & Prettier — Code quality tooling active'));
    }

    return badges.join('\n');
  }

  /**
   * Generate a footer with the DevBoiler logo and brand text, rendered
   * at the bottom of every page (like Next.js). Uses a small SVG + "DevBoiler" label.
   */
  private getFooter(tw: boolean): string {
    const footerClass = tw ? ` className="${this.getCss({ addTailwind: tw, addZustand: false, addReactRouter: false, addEslintPrettier: false }).footer}"` : '';
    const logoClass = tw
      ? `className="${this.getCss({ addTailwind: tw, addZustand: false, addReactRouter: false, addEslintPrettier: false }).footerLogo}"`
      : 'style={{ width: \'20px\', height: \'20px\' }}';

    const footerStyle = tw ? '' : ' style={{ padding: \'1.5rem\', borderTop: \'1px solid #eee\', textAlign: \'center\', fontSize: \'0.75rem\', color: \'#999\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', gap: \'0.5rem\' }}';

    return `      <footer${footerClass}${footerStyle}>
        <svg ${logoClass} viewBox="0 0 425.85 338.09" xmlns="http://www.w3.org/2000/svg">
          <polygon fill="#A9A6A1" points="425.59,304.01 425.59,337.85 272.41,320.21 398.27,304.01" />
          <polygon fill="#AEADA8" points="425.59,89.6 425.59,280.01 407.67,184.88" />
          <polygon fill="#F5F6F0" points="425.59,89.6 407.67,184.88 389.74,95.97" />
          <polygon fill="#7D7C78" points="407.67,184.88 425.59,280.01 389.74,272.78" />
          <polygon fill="#E7E6E1" points="425.59,89.6 389.74,95.97 396.53,63.44" />
          <polygon fill="#494A45" points="425.59,280.01 398.27,304.01 389.74,272.78" />
          <polygon fill="#32342F" points="425.59,337.85 120.39,337.85 272.41,320.21" />
          <polygon fill="#475E4A" points="389.74,95.97 407.67,184.88 389.74,272.78" />
          <polygon fill="#706F6A" points="389.74,272.78 398.27,304.01 273.79,288.54" />
          <polygon fill="#A8AAA5" points="398.27,304.01 272.41,320.21 146.56,304.01" />
          <polygon fill="#FAFDF6" points="396.53,63.44 389.74,95.97 272.63,79.34" />
          <polygon fill="#DDDED8" points="396.53,63.44 272.63,79.34 272.61,79.34 148.58,63.44" />
          <polygon fill="#7E7F79" points="396.53,63.44 148.58,63.44 272.63,34.23" />
          <polygon fill="#EEF1EA" points="396.53,63.44 272.63,34.23 285.93,34.23 296.49,34.23 353.31,34.23" />
          <polygon fill="#B3B2AE" points="389.74,95.97 389.74,272.78 272.92,183.15" />
          <polygon fill="#D2D3CD" points="389.74,95.97 272.92,183.15 272.56,95.97" />
          <polygon fill="#34623D" points="389.74,95.97 272.56,95.97 157.26,95.97 272.61,79.34 272.63,79.34" />
          <polygon fill="#D3DECD" points="389.74,272.78 273.79,288.54 156.1,272.78" />
          <polygon fill="#617460" points="389.74,272.78 156.1,272.78 272.92,183.15" />
          <polygon fill="#9C9D97" points="305.74,10.23 296.49,34.23 285.93,34.23 293.02,10.23" />
          <polygon fill="#E6E5E0" points="305.74,10.23 293.02,10.23 284.2,0.25 295.62,0.25" />
          <polygon fill="#CACBC5" points="284.2,0.25 293.02,10.23 252.25,10.23 278.27,0.25" />
          <polygon fill="#5B5C57" points="293.02,10.23 285.93,34.23 272.63,34.23 258.17,34.23 252.25,10.23" />
          <polygon fill="#B0AFAB" points="278.27,0.25 252.25,10.23 252.25,0.25" />
          <polygon fill="#3B3D38" points="273.79,288.54 146.56,304.01 156.1,272.78" />
          <path fill="#1F2A24" d="M272.56,95.97l0.36,87.18l-116.24,0.57l0.58-87.75H272.56z M257.45,164.35v-8.24h-38.02v8.24H257.45z M211.62,141.36v-8.53l-34.12-17.92v9.97l22.99,12.44l-22.99,13.44v10.7L211.62,141.36z" />
          <polygon fill="#717B70" points="272.92,183.15 156.1,272.78 156.68,183.72" />
          <polygon fill="#959691" points="272.63,34.23 148.58,63.44 193.84,34.23 250.51,34.23 258.17,34.23" />
          <polygon fill="#B1B0AB" points="272.61,79.34 157.26,95.97 148.58,63.44" />
          <polygon fill="#636260" points="272.41,320.21 120.39,337.85 119.81,304.01 146.56,304.01" />
          <polygon fill="#777A73" points="252.25,10.23 258.17,34.23 250.51,34.23 240.53,10.23" />
          <rect x="219.43" y="156.11" fill="#8FFC89" width="38.02" height="8.24" />
          <polygon fill="#656A66" points="252.25,0.25 252.25,10.23 240.53,10.23" />
          <polygon fill="#8FFC89" points="211.62,132.83 211.62,141.36 177.5,161.46 177.5,150.76 200.49,137.32 177.5,124.88 177.5,114.91" />
          <polygon fill="#757573" points="148.58,63.44 157.26,95.97 120.39,90.62" />
          <polygon fill="#ABD6A9" points="157.26,95.97 156.68,183.72 156.1,272.78 137.45,182.71" />
          <polygon fill="#696B66" points="157.26,95.97 137.45,182.71 120.39,90.62" />
          <polygon fill="#3A3A3A" points="137.45,182.71 156.1,272.78 120.39,278.28" />
          <polygon fill="#5C5C5A" points="156.1,272.78 146.56,304.01 120.39,278.28" />
          <polygon fill="#ACADA7" points="120.39,90.62 137.45,182.71 120.39,278.28 120.39,263.53 120.39,197.03 120.39,150.76 120.39,144.69" />
          <polygon fill="#4B4B49" points="120.39,197.03 120.39,263.53 90.17,182.57" />
          <polygon fill="#787876" points="120.39,150.76 120.39,197.03 90.17,182.57" />
          <polygon fill="#C1C2BC" points="120.39,144.69 120.39,150.76 90.17,182.57 44.78,82.38 56.78,82.38 110.7,144.69" />
          <polygon fill="#404040" points="90.17,182.57 120.39,263.53 62.85,219.15" />
          <polygon fill="#7A8080" points="44.78,82.38 90.17,182.57 35.52,124.45" />
          <polygon fill="#66676B" points="35.52,124.45 90.17,182.57 62.85,219.15" />
          <polygon fill="#60635C" points="44.78,82.38 35.52,124.45 0.25,82.38" />
        </svg>
        DevBoiler
      </footer>`;
  }

  private getMinimalApp(): string {
    return `function App() {
  return (
    <main>
      <h1>React + Vite + TypeScript</h1>
      <p>Start building from this bloat-free setup.</p>
    </main>
  );
}

export default App;
`;
  }

  private getTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  }

  private getPostCssConfig(): string {
    return `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
}
`;
  }

  private getTailwindCss(): string {
    return `@import "tailwindcss";
`;
  }

  private getCounterStore(): string {
    return `import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`;
  }

  /**
   * Generate a standalone React Router dashboard layout
   * Renders a DevBoiler Status Dashboard with feature badges and SVG logo.
   * Uses Tailwind v4 classes when enabled, clean HTML fallback otherwise.
   */
  private getReactRouterApp(features: FeatureFlags): string {
    const css = this.getCss(features);
    const badges = this.getFeatureBadges(features);
    const tw = features.addTailwind;
    const footer = this.getFooter(tw);

    // Navigation links — shared between both views
    const navLinks = tw
      ? `<Link to="/" className="${css.navLink}">Dashboard</Link>
        <Link to="/architecture" className="${css.navLink}">System Architecture</Link>`
      : `<Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/architecture">System Architecture</Link>`;

    const appShellClass = tw ? ` className="${css.appShell}"` : '';
    const navClass = tw ? ` className="${css.nav}"` : '';
    const navStyle = tw ? '' : ' style={{ padding: \'1rem\', borderBottom: \'1px solid #eee\', marginBottom: \'2rem\' }}';

    const dashboardClass = tw ? ` className="${css.dashboard}"` : '';
    const h1Class = tw ? ` className="${css.h1}"` : '';
    const leadClass = tw ? ` className="${css.lead}"` : '';
    const h2Class = tw ? ` className="${css.h2}"` : '';
    const badgeListClass = tw ? ` className="${css.badgeList}"` : '';
    const tipClass = tw ? ` className="${css.tip}"` : '';
    const bodyClass = tw ? ` className="${css.body}"` : '';
    const archClass = tw ? ` className="${css.architecture}"` : '';

    const zustandTip = features.addZustand
      ? `        <p${tipClass}>
          Tip: Navigate to System Architecture to see the global counter in action.
        </p>`
      : '';

    return `import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Dashboard — project status overview
function Dashboard() {
  return (
    <div${dashboardClass}>
      <h1${h1Class}>DevBoiler Status Dashboard</h1>
      <p${leadClass}>Your scaffolded project is ready. Below are the active tooling layers.</p>

      <h2${h2Class}>Active Features</h2>
      <ul${badgeListClass}>
${badges}
      </ul>

${zustandTip}
    </div>
  );
}

// System Architecture — explains the routing layer
function Architecture() {
  return (
    <div${archClass}>
      <h1${h1Class}>System Architecture</h1>
      <p${bodyClass}>
        React Router provides client-side routing between these views.
        The URL bar updates without a full page reload, enabling fast
        navigation across the application.
      </p>
    </div>
  );
}

// Main App component with two-route navigation
function App() {
  return (
    <div${appShellClass}>
      <Router>
        <nav${navClass}${navStyle}>
          ${navLinks}
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
        ${footer}
      </Router>
    </div>
  );
}

export default App;
`;
  }

  /**
   * Generate a composable multi-page dashboard with Zustand integration
   * Demonstrates reading and writing to a Zustand store across routes.
   * Uses Tailwind v4 classes when enabled, clean HTML fallback otherwise.
   */
  private getComposableAppLayout(features: FeatureFlags): string {
    const css = this.getCss(features);
    const badges = this.getFeatureBadges(features);
    const tw = features.addTailwind;
    const footer = this.getFooter(tw);

    // Navigation links
    const navLinks = tw
      ? `<Link to="/" className="${css.navLink}">Dashboard</Link>
        <Link to="/architecture" className="${css.navLink}">System Architecture</Link>`
      : `<Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/architecture">System Architecture</Link>`;

    const appShellClass = tw ? ` className="${css.appShell}"` : '';
    const navClass = tw ? ` className="${css.nav}"` : '';
    const navStyle = tw ? '' : ' style={{ padding: \'1rem\', borderBottom: \'1px solid #eee\', marginBottom: \'2rem\' }}';

    const dashboardClass = tw ? ` className="${css.dashboard}"` : '';
    const h1Class = tw ? ` className="${css.h1}"` : '';
    const leadClass = tw ? ` className="${css.lead}"` : '';
    const h2Class = tw ? ` className="${css.h2}"` : '';
    const badgeListClass = tw ? ` className="${css.badgeList}"` : '';
    const counterValueClass = tw ? ` className="${css.counterValue}"` : '';
    const buttonGroupClass = tw ? ` className="${css.buttonGroup}"` : '';
    const buttonClass = tw ? ` className="${css.button}"` : '';
    const bodyClass = tw ? ` className="${css.body}"` : '';
    const archClass = tw ? ` className="${css.architecture}"` : '';
    const tipClass = tw ? ` className="${css.tip}"` : '';

    // Buttons with conditional Tailwind or inline styles
    let buttonInc: string;
    let buttonDec: string;
    let buttonReset: string;
    if (tw) {
      buttonInc = `<button onClick={increment} className="${css.button}">+ Increment</button>`;
      buttonDec = `<button onClick={decrement} className="${css.button}">- Decrement</button>`;
      buttonReset = `<button onClick={reset} className="${css.button}">Reset</button>`;
    } else {
      buttonInc = `<button onClick={increment} style={{ marginRight: '0.5rem' }}>+ Increment</button>`;
      buttonDec = `<button onClick={decrement} style={{ marginRight: '0.5rem' }}>- Decrement</button>`;
      buttonReset = `<button onClick={reset}>Reset</button>`;
    }

    return `import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useCounterStore } from '@/store/counterStore';

// Dashboard — project status overview with global counter
function Dashboard() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div${dashboardClass}>
      <h1${h1Class}>DevBoiler Status Dashboard</h1>
      <p${leadClass}>Your scaffolded project is ready. Below are the active tooling layers.</p>

      <h2${h2Class}>Active Features</h2>
      <ul${badgeListClass}>
${badges}
      </ul>

      <h2${h2Class}>Global State — Zustand Counter</h2>
      <p${bodyClass}>The counter below is backed by a Zustand store. Navigate to System Architecture
         to confirm the value persists across routes.</p>
      <p${counterValueClass}>Count: {count}</p>
      <div${buttonGroupClass}>
        ${buttonInc}
        ${buttonDec}
        ${buttonReset}
      </div>
    </div>
  );
}

// System Architecture — reads the same Zustand counter, proving persistence
function Architecture() {
  const count = useCounterStore((state) => state.count);

  return (
    <div${archClass}>
      <h1${h1Class}>System Architecture</h1>
      <p${bodyClass}>
        React Router provides client-side routing between these views.
        The URL bar updates without a full page reload, enabling fast
        navigation across the application.
      </p>

      <h2${h2Class}>Cross-Route State Persistence</h2>
      <p${bodyClass}>
        The shared Zustand counter is currently: <strong>${tw ? ' ' : ''}{count}</strong>
      </p>
      <p${tipClass}>
        Return to the Dashboard to modify it — this value will update in real time.
      </p>
    </div>
  );
}

// Main App component with two-route navigation
function App() {
  return (
    <div${appShellClass}>
      <Router>
        <nav${navClass}${navStyle}>
          ${navLinks}
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
        ${footer}
      </Router>
    </div>
  );
}

export default App;
`;
  }

  private getEslintConfig(): string {
    return `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
`;
  }

  private getPrettierConfig(): string {
    return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;
  }

  private getEslintIgnore(): string {
    return `node_modules
dist
build
coverage
`;
  }
}