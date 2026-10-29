const Docker = require('dockerode');
const docker = new Docker();

function toBase64(str) {
    return Buffer.from(str || '', 'utf8').toString('base64');
}

// Supported language configs
const LANGUAGE_CONFIG = {
    python: {
        image: 'codearena-python',
        timeout: 5000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/solution.py && echo '${in64}' | base64 -d | python3 -u /tmp/solution.py`];
        }
    },
    cpp: {
        image: 'codearena-cpp',
        timeout: 6000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/main.cpp && g++ /tmp/main.cpp -O2 -o /tmp/main 2>&1 && echo '${in64}' | base64 -d | /tmp/main`];
        }
    },
    c: {
        image: 'codearena-c',
        timeout: 6000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/main.c && gcc /tmp/main.c -O2 -o /tmp/main 2>&1 && echo '${in64}' | base64 -d | /tmp/main`];
        }
    },
    javascript: {
        image: 'codearena-javascript',
        timeout: 5000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/main.js && echo '${in64}' | base64 -d | node /tmp/main.js`];
        }
    },
    java: {
        image: 'codearena-java',
        timeout: 7000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/) || code.match(/class\s+([A-Za-z0-9_]+)/);
            const className = match ? match[1] : 'Main';
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/${className}.java && javac /tmp/${className}.java 2>&1 && echo '${in64}' | base64 -d | java -cp /tmp ${className}`];
        }
    },
    php: {
        image: 'codearena-php',
        timeout: 5000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /tmp/main.php && echo '${in64}' | base64 -d | php /tmp/main.php`];
        }
    },
    csharp: {
        image: 'codearena-csharp',
        timeout: 9000,
        getCmd: (code, stdin) => {
            const c64 = toBase64(code);
            const in64 = toBase64(stdin);
            return ['sh', '-c', `echo '${c64}' | base64 -d > /sandbox/app/Program.cs && echo '${in64}' | base64 -d | dotnet run --no-restore --project /sandbox/app -v q`];
        }
    }
};

// Simple function to run code once with input
async function runOnce(code, language, stdin = '') {
    const config = LANGUAGE_CONFIG[language];
    
    if (!config) {
        return {
            success: false,
            output: '',
            error: `Language '${language}' not supported`,
            executionTime: 0
        };
    }

    const startTime = Date.now();
    let container = null;
    let killed = false;
    
    try {
        // Create container with command that includes input
        container = await docker.createContainer({
            Image: config.image,
            Cmd: config.getCmd(code, stdin),
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
            Env: [
                'DOTNET_CLI_TELEMETRY_OPTOUT=1',
                'DOTNET_NOLOGO=1',
                'PYTHONUNBUFFERED=1'
            ],
            HostConfig: {
                Memory: 256 * 1024 * 1024,  // 256MB
                MemorySwap: 256 * 1024 * 1024,
                CpuQuota: 50000,
                NetworkMode: 'none',
                AutoRemove: false
            }
        });

        // Start container
        await container.start();

        // Set timeout
        const timeout = setTimeout(async () => {
            killed = true;
            try {
                await container.kill();
            } catch (e) {}
        }, config.timeout || 5000);

        // Wait for container to finish
        await container.wait();
        clearTimeout(timeout);

        // Get output
        const logs = await container.logs({
            stdout: true,
            stderr: true
        });

        // Clean output
        let output = cleanDockerLogs(logs);

        // Remove container
        await container.remove();

        const executionTime = Date.now() - startTime;

        if (killed) {
            return {
                success: false,
                output: '',
                error: 'Time limit exceeded',
                executionTime
            };
        }

        return {
            success: true,
            output: output.trim(),
            error: '',
            executionTime
        };

    } catch (err) {
        if (container) {
            try {
                await container.remove({ force: true });
            } catch (e) {}
        }
        
        return {
            success: false,
            output: '',
            error: err.message,
            executionTime: Date.now() - startTime
        };
    }
}

// Run code against multiple test cases
async function executeCode(code, language, testCases = []) {
    // If no test cases, just run once
    if (testCases.length === 0) {
        return await runOnce(code, language, '');
    }

    // Run against each test case
    const results = [];
    let passedCount = 0;

    for (const tc of testCases) {
        const result = await runOnce(code, language, tc.input || '');

        // Compare output (trim whitespace)
        const actualOutput = result.output.trim();
        const expectedOutput = (tc.expected_output || '').trim();
        const passed = result.success && actualOutput === expectedOutput;

        if (passed) passedCount++;

        results.push({
            testCaseId: tc.id,
            input: tc.input || '',
            expectedOutput: expectedOutput,
            actualOutput: actualOutput,
            passed: passed,
            hidden: tc.is_hidden,
            executionTime: result.executionTime,
            error: result.error || null
        });
    }

    return {
        success: passedCount === testCases.length,
        passedCount,
        totalCount: testCases.length,
        results,
        status: passedCount === testCases.length ? 'accepted' : 'wrong_answer'
    };
}

// Clean Docker log output (remove 8-byte headers)
function cleanDockerLogs(data) {
    // Convert to buffer if it's a string
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    
    let output = '';
    let i = 0;
    
    while (i < buffer.length) {
        if (i + 8 <= buffer.length) {
            // Read size from header
            const size = buffer.readUInt32BE(i + 4);
            i += 8;
            
            if (i + size <= buffer.length) {
                output += buffer.slice(i, i + size).toString('utf8');
                i += size;
            } else {
                break;
            }
        } else {
            output += buffer.slice(i).toString('utf8');
            break;
        }
    }
    
    // Strip dotnet workload banner and compiler warnings if present
    output = output.replace(/An issue was encountered verifying workloads[^\n]*\n?/g, '');
    output = output.replace(/^[^\n]*:\s*warning\s+CS\d+:[^\n]*\n?/gm, '');
    
    return output;
}

module.exports = { executeCode, runOnce };