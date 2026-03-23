export interface EnvironmentConfig {
  serverUrl: string;
  clientUrl: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  local: {
    serverUrl: 'http://localhost:3000',
    clientUrl: 'http://localhost:5173',
  },
  staging: {
    serverUrl: 'https://staging-api.codejam.app',
    clientUrl:
      'https://codejam-web08jamstack-6306-jamstacks-projects.vercel.app',
  },
  production: {
    serverUrl: 'https://api.codejam.app',
    clientUrl: 'https://www.codejam.app',
  },
};

export function getConfig(env?: string): EnvironmentConfig {
  const environment = env || 'production';
  const config = environments[environment];

  if (!config) {
    throw new Error(
      `Unknown environment: ${environment}. Available: ${Object.keys(environments).join(', ')}`,
    );
  }

  return config;
}
