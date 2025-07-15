#!/bin/bash

# Rust Integration Test Setup Script
# This script sets up Rust bincode integration testing

echo "Setting up Rust bincode integration tests..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    export PATH="$PATH:$HOME/.cargo/bin"
fi

echo "Rust version:"
rustc --version
cargo --version

# Build and run the test data generator
echo "Building Rust test data generator..."
cd rust-integration
cargo build --release

echo "Generating test data..."
cargo run --bin generate_test_data

echo "Test data generation complete!"
echo "Generated files:"
ls -la ../test-data/

echo "You can now run the integration tests with: npm run test:integration"
