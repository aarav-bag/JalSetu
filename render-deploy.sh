#!/bin/bash

# Install dependencies globally
npm install -g vite esbuild

# Install project dependencies
npm install

# Run build manually
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"