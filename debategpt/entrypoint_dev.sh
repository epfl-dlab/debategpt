#!/bin/bash

export OPENAI_API_KEY=`cat ../secrets/OPENAI_API_KEY.txt`
if [ -f ../secrets/MISTRAL_API_KEY.txt ]; then
    export MISTRAL_API_KEY=`cat ../secrets/MISTRAL_API_KEY.txt`
else
    export MISTRAL_API_KEY=""
fi
echo "OpenAI Key: $OPENAI_API_KEY"
echo "Mistral Key: $MISTRAL_API_KEY"

if [ -f .empirica/local/tajriba.json ]; then
    rm .empirica/local/tajriba.json
    echo "Removed tajriba.json file."
else
    echo "No tajriba.json file found to remove."
fi

if command -v empirica > /dev/null; then
    echo "Starting empirica ..."
    empirica version
    empirica
else
    echo "Empirica command not found. Please install Empirica before running this script."
fi
