#!/bin/bash
#
# Azure OpenAI Proxy Health Checker
#

set -e

PROXY_URL="${PROXY_URL:-http://localhost:3001}"
HEALTH_ENDPOINT="$PROXY_URL/health"

echo "🔍 Checking Azure OpenAI Proxy Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Endpoint: $HEALTH_ENDPOINT"
echo ""

# Check if proxy is reachable
if ! curl -s --connect-timeout 5 "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
    echo "❌ Error: Proxy server is not responding"
    echo ""
    echo "Possible causes:"
    echo "  • Proxy server is not running"
    echo "  • Port 3001 is blocked or in use"
    echo "  • Firewall blocking connection"
    echo ""
    echo "To start the proxy server:"
    echo "  ./run-webui-with-azure.sh"
    echo ""
    exit 1
fi

# Get health data
HEALTH_DATA=$(curl -s "$HEALTH_ENDPOINT")

# Parse JSON using jq if available, otherwise use grep
if command -v jq &> /dev/null; then
    STATUS=$(echo "$HEALTH_DATA" | jq -r '.status')
    SERVICE=$(echo "$HEALTH_DATA" | jq -r '.service')
    ENDPOINT=$(echo "$HEALTH_DATA" | jq -r '.endpoint')
    API_VERSION=$(echo "$HEALTH_DATA" | jq -r '.apiVersion')
else
    STATUS=$(echo "$HEALTH_DATA" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    SERVICE=$(echo "$HEALTH_DATA" | grep -o '"service":"[^"]*"' | cut -d'"' -f4)
    ENDPOINT=$(echo "$HEALTH_DATA" | grep -o '"endpoint":"[^"]*"' | cut -d'"' -f4)
    API_VERSION=$(echo "$HEALTH_DATA" | grep -o '"apiVersion":"[^"]*"' | cut -d'"' -f4)
fi

# Display results
if [ "$STATUS" = "ok" ]; then
    echo "✅ Status: $STATUS"
else
    echo "❌ Status: $STATUS"
fi

echo "🔧 Service: $SERVICE"
echo "🌐 Azure Endpoint: $ENDPOINT"
echo "📋 API Version: $API_VERSION"
echo ""

# Check if web UI is also running
if curl -s --connect-timeout 3 http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Web UI: Running (http://localhost:5173)"
else
    echo "⚠️  Web UI: Not running"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Proxy is healthy and ready to use!"
echo ""
