const API_KEY = "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";

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const solutionEl = document.getElementById("solution");
const reportEl = document.getElementById("report");
const resultsSection = document.getElementById("results-section");

const buffBtn = document.getElementById("buffBtn");
const nerfBtn = document.getElementById("nerfBtn");
const spoilerBtn = document.getElementById("spoilerBtn");

async function askAI(task, statement) {
    const modifier = task === "BUFF" ? "significantly harder" : "significantly easier";
    
    const prompt = `
You are an expert competitive programming problem setter.

Rewrite the following problem to be ${modifier}.

Requirements for the Modified Problem:
- Rewrite the actual statement.
- Keep the same theme.
- Do NOT merely change constraints.
- Do NOT add unrelated concepts.
- Include a valid Sample Input.
- Include a valid Sample Output.
- Include a short explanation of the sample.

CRITICAL INSTRUCTION:
After you finish the modified problem, you must output EXACTLY the string "===SOLUTION===" on a new line.

Requirements for the Solution:
- Immediately following the "===SOLUTION===" string, provide a solution specifically for your NEW modified problem.
- Format with: 1. Main Idea, 2. Algorithm, 3. Complexity.
- No code. Be concise. Explain enough that a contestant could implement it.

Original Problem:
${statement}
`;

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href,
                "X-Title": "CP Problem Modifier"
            },
            body: JSON.stringify({
                model: "tencent/hy3:free",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const data = await response.json();

    if (!data.choices || !data.choices.length || !data.choices[0].message) {
        throw new Error("Invalid API response.");
    }

    return data.choices[0].message.content;
}

async function run(task) {
    const statement = inputEl.value.trim();

    if (!statement) {
        alert("Please enter a problem statement.");
        return;
    }

    // Reset UI State for new generation
    resultsSection.classList.remove("hidden");
    outputEl.textContent = "Generating modified problem and solution...";
    solutionEl.textContent = "";
    solutionEl.classList.add("hidden");
    spoilerBtn.classList.add("hidden");
    spoilerBtn.textContent = "Show Solution";
    reportEl.textContent = "Processing...";

    // Disable buttons to prevent spamming
    buffBtn.disabled = true;
    nerfBtn.disabled = true;

    try {
        const start = performance.now();
        const result = await askAI(task, statement);
        const end = performance.now();

        // Split the response using our specific delimiter
        const parts = result.split("===SOLUTION===");

        // Display the problem
        outputEl.textContent = parts[0].trim();

        // Display the solution & spoiler button if the AI successfully generated the delimiter
        if (parts.length > 1) {
            solutionEl.textContent = parts[1].trim();
            spoilerBtn.classList.remove("hidden");
        }

        reportEl.textContent = `Task: ${task}\nStatus: Success\nTime: ${(end - start).toFixed(0)} ms`;
    }
    catch (err) {
        outputEl.textContent = "Failed to generate.";
        reportEl.textContent = `Task: ${task}\nStatus: Error\n\n${err.message}`;
    }
    finally {
        // Re-enable buttons
        buffBtn.disabled = false;
        nerfBtn.disabled = false;
    }
}

// Event Listeners
buffBtn.addEventListener("click", () => run("BUFF"));
nerfBtn.addEventListener("click", () => run("NERF"));

// Spoiler toggle logic
spoilerBtn.addEventListener("click", () => {
    const isHidden = solutionEl.classList.contains("hidden");
    if (isHidden) {
        solutionEl.classList.remove("hidden");
        spoilerBtn.textContent = "Hide Solution";
    } else {
        solutionEl.classList.add("hidden");
        spoilerBtn.textContent = "Show Solution";
    }
});