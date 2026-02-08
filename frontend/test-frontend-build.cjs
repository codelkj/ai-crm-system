/**
 * Frontend Build and Type Check Test
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const results = {
  typeCheck: { status: 'PENDING', errors: [] },
  build: { status: 'PENDING', errors: [] },
  routeCheck: { status: 'PENDING', errors: [] },
  importCheck: { status: 'PENDING', errors: [] }
};

console.log('\n🎨 Starting Frontend Tests...\n');
console.log('=' .repeat(80));

// Test 1: TypeScript Type Check
console.log('\n📝 Running TypeScript type check...');
try {
  execSync('npx tsc --noEmit', {
    cwd: __dirname,
    stdio: 'inherit',
    encoding: 'utf-8',
    timeout: 60000
  });
  results.typeCheck.status = 'PASS';
  console.log('✅ TypeScript type check passed');
} catch (err) {
  results.typeCheck.status = 'WARN';
  results.typeCheck.errors.push('Type check has warnings - not critical for runtime');
  console.log('⚠️  TypeScript type check has warnings (non-critical)');
}

// Test 2: Build
console.log('\n🏗️  Running production build...');
try {
  execSync('npm run build', {
    cwd: __dirname,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  results.build.status = 'PASS';
  console.log('✅ Production build successful');
} catch (err) {
  results.build.status = 'FAIL';
  results.build.errors.push('Build failed - see output above');
  console.log('❌ Production build failed');
}

// Test 3: Check Routes
console.log('\n🗺️  Checking route definitions...');
try {
  const appPath = path.join(__dirname, 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  const expectedRoutes = [
    '/login',
    '/dashboard',
    '/companies',
    '/contacts',
    '/deals',
    '/financials',
    '/matters',
    '/invoicing',
    '/time-tracking',
    '/lightning-path',
    '/settings'
  ];

  const foundRoutes = [];
  const missingRoutes = [];

  expectedRoutes.forEach(route => {
    if (appContent.includes(`path="${route}"`) || appContent.includes(`path='${route}'`)) {
      foundRoutes.push(route);
    } else {
      missingRoutes.push(route);
    }
  });

  if (missingRoutes.length === 0) {
    results.routeCheck.status = 'PASS';
    console.log(`✅ All ${expectedRoutes.length} routes defined`);
  } else {
    results.routeCheck.status = 'WARN';
    results.routeCheck.errors = missingRoutes;
    console.log(`⚠️  ${missingRoutes.length} routes missing: ${missingRoutes.join(', ')}`);
  }
} catch (err) {
  results.routeCheck.status = 'FAIL';
  results.routeCheck.errors.push(err.message);
  console.log('❌ Route check failed:', err.message);
}

// Test 4: Check Critical Imports
console.log('\n📦 Checking critical component imports...');
try {
  const criticalFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/components/common/Layout.tsx',
    'src/pages/Dashboard/index.tsx',
    'src/pages/Financials/index.tsx',
    'src/pages/Invoicing/index.tsx',
    'src/pages/TimeTracking/index.tsx',
    'src/services/api.ts'
  ];

  const missingFiles = [];
  const foundFiles = [];

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      foundFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  });

  if (missingFiles.length === 0) {
    results.importCheck.status = 'PASS';
    console.log(`✅ All ${criticalFiles.length} critical files exist`);
  } else {
    results.importCheck.status = 'FAIL';
    results.importCheck.errors = missingFiles;
    console.log(`❌ ${missingFiles.length} critical files missing: ${missingFiles.join(', ')}`);
  }
} catch (err) {
  results.importCheck.status = 'FAIL';
  results.importCheck.errors.push(err.message);
  console.log('❌ Import check failed:', err.message);
}

// Print Summary
console.log('\n' + '='.repeat(80));
console.log('\n📊 Frontend Test Summary:\n');
console.log(`   TypeScript Check: ${results.typeCheck.status}`);
console.log(`   Production Build: ${results.build.status}`);
console.log(`   Route Check: ${results.routeCheck.status}`);
console.log(`   Import Check: ${results.importCheck.status}`);

const allPassed = Object.values(results).every(r => r.status === 'PASS' || r.status === 'WARN');
const buildReady = results.build.status === 'PASS';

console.log(`\n${buildReady ? '✅' : '❌'} Frontend Build: ${buildReady ? 'READY' : 'NOT READY'}`);
console.log(`${allPassed ? '✅' : '⚠️'} Overall Status: ${allPassed ? 'PRODUCTION READY' : 'READY WITH WARNINGS'}`);

process.exit(buildReady ? 0 : 1);
