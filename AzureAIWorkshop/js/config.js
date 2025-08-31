// Azure Configuration File
// This file contains all central configurations for Azure services
// Replace the values with your actual details

const AzureConfig = {
    // Azure OpenAI Configuration
    openAI: {
        endpoint: "https://your-openai-resource.openai.azure.com/",
        apiKey: "your-openai-api-key",
        deploymentName: "your-deployment-name",
        apiVersion: "your-api-version"
    },

    // Azure Search Configuration (for RAG)
    search: {
        endpoint: "https://your-search-resource.search.windows.net",
        apiKey: "your-search-api-key",
        indexName: "your-index-name",
        semantic_configuration: "your-semantic-configuration",
        embeddingDeploymentName: "your-embedding-deployment-name",
        queryType: "your-query-type"
    },

    // Azure Speech Services Configuration
    speech: {
        endpoint: "https://your-region.api.cognitive.microsoft.com/",
        subscriptionKey: "your-speech-api-key",
        region: "your-region"
    },

    // Azure Document Intelligence Configuration
    documentIntelligence: {
        endpoint: "https://your-region.api.cognitive.microsoft.com/",
        subscriptionKey: "your-document-intelligence-key"
    },

    // DALL-E Configuration (through Azure OpenAI)
    dalle: {
        endpoint: "https://your-dalle-resource.openai.azure.com/",
        apiKey: "your-dalle-api-key"
    }
};

// Function to get full URL for service
function getServiceUrl(service, path = '') {
    const config = AzureConfig[service];
    if (!config) {
        throw new Error(`Service ${service} not configured`);
    }
    return config.endpoint + path;
}

// Function to get common headers
function getCommonHeaders(service) {
    const config = AzureConfig[service];
    if (!config) {
        throw new Error(`Service ${service} not configured`);
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    // Add appropriate header for each service
    if (config.apiKey) {
        if (service === 'openAI' || service === 'dalle') {
            headers['api-key'] = config.apiKey;
        } else {
            headers['Ocp-Apim-Subscription-Key'] = config.subscriptionKey || config.apiKey;
        }
    }

    return headers;
}

// Configuration validation
function validateConfig(servicesToCheck = []) {
    const issues = [];

    // If no specific services provided, only validate services that don't contain 'your-' placeholders
    const servicesToValidate = servicesToCheck.length > 0 ? servicesToCheck : 
        Object.keys(AzureConfig).filter(serviceName => {
            const serviceConfig = AzureConfig[serviceName];
            const hasEndpoint = serviceConfig.endpoint && !serviceConfig.endpoint.includes('your-');
            const keyField = serviceConfig.apiKey ? 'apiKey' : 'subscriptionKey';
            const keyValue = serviceConfig[keyField];
            const hasKey = keyValue && !keyValue.includes('your-');
            return hasEndpoint && hasKey;
        });

    for (const serviceName of servicesToValidate) {
        const serviceConfig = AzureConfig[serviceName];
        if (!serviceConfig.endpoint || serviceConfig.endpoint.includes('your-')) {
            issues.push(`${serviceName}: Endpoint not configured properly`);
        }
        
        const keyField = serviceConfig.apiKey ? 'apiKey' : 'subscriptionKey';
        const keyValue = serviceConfig[keyField];
        
        if (!keyValue || keyValue.includes('your-')) {
            issues.push(`${serviceName}: ${keyField} not configured properly`);
        }
    }

    return {
        isValid: issues.length === 0,
        issues: issues
    };
}

// Validate specific service
function validateService(serviceName) {
    return validateConfig([serviceName]);
}
