css_append = """

/* Styling for code execution outputs */
pre[data-language="output"] {
    background-color: var(--color-quartz-light) !important;
    border-left: 4px solid var(--color-quartz-accent) !important;
    color: var(--text-primary) !important;
    font-style: italic;
    opacity: 0.9;
}

.dark pre[data-language="output"] {
    background-color: #1a1a1a !important;
    border-left: 4px solid var(--color-quartz-accent) !important;
    color: #a0a0a0 !important;
}
"""

with open("src/styles/global.css", "a", encoding="utf-8") as f:
    f.write(css_append)
print("CSS appended.")
