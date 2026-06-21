const tailwindConfig = {
	theme: {
		extend: {
			colors: {
				primary: { "500": "#002878", hover: "#092C4C", DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
				secondary: { "500": "#B0C4DE", DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
				info: { "500": "#00BFFF" },
				auxiliary: "red",
				success: { "500": "#27AE60" },
				warning: { "500": "#E2B93B" },
				error: { "500": "#EB5757", secondary: "#EBB5B5" },
				disabled: { "500": "#BDBDBD" },
				black: { "1": "#000000", "2": "#1D1D1D", "3": "#282828" },
				white: { "500": "#FFFFFF" },
				grey: { "1": "#333333", "2": "#4F4F4F", "3": "#828282", "4": "#BDBDBD", "5": "#E0E0E0", "6": "#EBEBEB", "7": "#F5F5F5", "8": "#FAFAFA" },
				shape: { terminal: "#FFB100", process: "#AB44F4", data: "#1BC861", decision: "#5468E9" },
				selectionFrame: { fill: "#2436b155", stroke: "#2436b1" },
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
				popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
				muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
				accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
				destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: { "1": "hsl(var(--chart-1))", "2": "hsl(var(--chart-2))", "3": "hsl(var(--chart-3))", "4": "hsl(var(--chart-4))", "5": "hsl(var(--chart-5))" }
			}
		}
	}
};

export default tailwindConfig;