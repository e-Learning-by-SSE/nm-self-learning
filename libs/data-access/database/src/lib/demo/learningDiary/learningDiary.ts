/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";
import {
	getRandomCreatedAt,
	getRandomElementFromArray,
	getRandomTimeIntervalInMs
} from "../../seed-functions";

const prisma = new PrismaClient();
const DEFAULT_SLUG = "the-beginners-guide-to-react";

// Reuse this function for generating random numbers within a range

export async function generateLearningDiaryDemoData() {
	console.log("\x1b[94m%s\x1b[0m", "Learning Diary Example:");

	try {
		// Ensure the student "Dumbledore" exists in the database
		const student = await prisma.student.findUnique({
			where: { username: "dumbledore" }
		});

		if (!student) {
			console.error('Student "Dumbledore" not found.');
			return;
		}

		// Query the first 10 courses (hard-coded)
		const courses = await prisma.course.findMany({
			take: 10
		});

		// Ensure courses array is populated correctly
		if (!courses || courses.length === 0) {
			console.error("No courses found.");
			return;
		}

		const technique1 = await prisma.learningTechnique.findFirst({
			where: { name: "Einschätzung der persönlichen Zufriedenheit mit dem Erreichten" }
		});
		const technique2 = await prisma.learningTechnique.findFirst({
			where: { name: "Arbeitskontrakt abschließen" }
		});

		if (!technique1 || !technique2) {
			console.error("Techniques Not Found");
			return;
		}

		// Create Learning Locations (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Locations");
		const location1 = await prisma.learningLocation.create({
			// IMG SRC: https://uxwing.com/books-icon/
			data: {
				id: "location-library",
				name: "Bibliothek",
				iconURL:
					"data:image/png;base64,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",
				defaultLocation: true
			}
		});

		const location2 = await prisma.learningLocation.create({
			// IMG SRC: https://uxwing.com/coffee-icon/
			data: {
				id: "location-cafe",
				name: "Cafe",
				iconURL:
					"data:image/png;base64,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",
				defaultLocation: true
			}
		});

		const location3 = await prisma.learningLocation.create({
			// IMG SRC: https://uxwing.com/house-color-icon/
			data: {
				id: "location-home",
				name: "zu Hause",
				iconURL:
					"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAZtUlEQVR4nO2deXxU1fXAv+/NmslkZpKQECCQCNmAQBJ2EEVQLAqo1YhrrSiKxa21P0SpYEUQEGitLSrFratdUGtt61JlFSEsgSBQtgCBQCBkIRASmJnM/P54M5MJzCTvZWayzvfzmY/m8O57b+aed8495557H4QJEyZMmDBhOiOq1r6BVkQN9HP993wr30uYFmYccBBwuj5/B2Ja9Y7CtAhq4AXARn3nuz9FwIjWu7UwoaYL8F+8Oj1Gq3UKguCtBJeAZ1rvFsOEitHAcbw6/+r4Ls7VN45x/nbkYGcXve5ya/ApncQlCK19Ay3As8ACJPOPShB4LL0PU/skew6ouGRlzs495JWVe7c7CtwDbG6xO20FOrICxAB/Aia4BfF6Pa/kZJIdY7niYKfTyTuFR1lx4DBOp9MttgLPA78I8r2pgUzAEOTzXgT2ATVyG3RUBRiBNLJP9AjiYpmX1Z8YnbbRhvkVlczesZuyi5e8xf8CfghUBOHehgEfuu7NEYTzeSMCZcCdwFo5DTqiAjwDLAS0AIIgMD2tNw/3SUYQ5H3dWnsdT23dyY6KSm/xUYLjEgqAgQGeoylOAj3kHNiRFCAG+B0wyS2I1mlZPGgAg2KiZZ/EpFGjV6mwORws2r2flQcPe/9zoC7BAFwAGDJsKJNvndzM0/hm9Vdfs27NOvefPYHiptqog3oHrccI4AMg2S0YHBvDwpzMJk2+N+7OB9CIInMG9mVEXCzPbCugymoFyaosA8bSPJcguv8nPSOdqdOmKmzeOOXl5d4KIKtvxaYPafM8A6zD1fmCIPBIWm/eGp7T7M73Zny3eD67fjQ5Da3IJGA7HSBx1J4VwAJ8jPREagHMWi3Lh+cwPbW3bH8P/jvfTaIhglVjRvBIam9vcTKS4rXrxFF7VYBhSE/gbW5BVoyFv1wznGGx8vM3AmDWaBrtfDdul/DOqKGYtBq32O0S2m3iqD0qwAykJ8/zOE5NuYq3RwwmTq+TfRKVIGDRatCplP0E47vF8/n111yeS2i3LqE9DQKNwDvAFLfArNWyICeTEV2UPXw6lYhJo2l2CJRoiODDMSN5Zfc+3jl4xC1ORlLMxqIET9x/+tQpNm74ppl34JvjRcd8Xqsx2ksYmA38FUhzC7JiLLySnUnXCL3skwiAUaMmQobJl8uXJ0/zzPYCzllt3uJ/AlPxHSUUAb2CdgO+OQfEAvamDmwPBSGPAquArm7BD3onMS87E5NG47/VZagEAbNWgy6InQ/QJ8rILT27s72iklO1F93idOAuII8rY/GjSGOXUFlfK/AjYIecg9uyBTAgmfy73QKjRs287Eyuje+i6ESBmnw52ByOy10C+E8cJQIvAtMAHs9IJSkyolnXLb9kZfHufe4//+a63mH/LRrSVhUgEymXn+ERRJtZnDOg1U1+UyhwCY8BbwJ8NPZqhviYoJJDUXUN13yxxv3ni8A8Je3bYhTwEJLp9HT+fb2TeHvkEEWd7x7lt2TnA9zYvSufjxt9eZRwC200SmhLCmAA/oBk9g0gPb1LhmTxk76pqBUkdnSiSIxOi0Zsna+XGGngwzEjeTjlKm9xMlKU8ONWuSk/tBUFyER6Qu53C/paTPzpmhGM7Ron+yQCEKVRY9bK8/cbS8tYsvcAdfXz/0FDI4q8mNWP344cjFHjGe9pgV8iZTDbROKoLeQBHgSW41UckZuUyP/1T1f01KsEAZNGLeupdwK/2XeIX7g6f/OZCt4cnkO8gkSSXCZ0TyDzehOP5e1gV+VZt/g2JLfQ6rSmBdAD77k+BoBItZqFgwbwXGZGyEx+pdXGDzduZcme/Z4nf2tZORNXf8PW8somWjePxEgDH183kqkpyd7iNmF9WysPkAZ8BdzoFqSbTbwxYhA5CkbDbpNv1Khlmfz8irPcuyGP7yqrrvi3C3Y7Hx07QaRaTU5sdNDDI5UgMDYhngyLibWnz2B11CfqKq1WxibEK05LA1RZbbxXeNT951qkcYZsWkML70by95luQW5SIu+NGkJPg/xYWMko3wm8e+goU9Zt4mRNLSBNGz/+1BO88/t3iYuXxhl2h4N5u/YyIy+fanuTSbRmcVP3BD67/hr6W8we2ZcnTzPh6w0U+FDMUNOSFkAP/BpYhGv6NkKl4qXsTB7sk4xKgcnXiiLROq2sNuftdp7aspO3Dx72mPyYmBh+8etfMnHyRBISEpg4aSJ7d++h5GQJAAfPVfPFydOMjo9TVFMgF4tWw13JiZy12SlwjQvO2Wx8WFRMlFZDdoxFtgUK1AK0lAKkAF/gVa6VEmVkxcghDFKYADGq1UTJNPl7qs5z34Y8tpbX518GDR7Em++8RUpqikcWERHBxMkTuVh7kV0FuwCosFr58FgxPSMjSTdFKbpHOagEgXEJ8aSZTaxzuYQ6p5O1p85w4Hw1Y7rGyXIJ7UEBcoF/A0luwa09u7NsSBYxWvlPl+gy+XLm7gE+OHqcRzdto/yS1SN78OGpvLRgHpGRkVccr9VpuXnyRJKTk1m3Zh12ux2rw8F/TpRQba9jdHwXRAVWSi5pJiOTEruzpaySM65K5IPnqvm0uIShXWLp2kRk0pYVQAu8BiwFdCCZ/LlZ/ZiW2luxybdoNahljPIv1tXxbP53vP6/gx6TbzaZWPLLJdwxJddnpZDBYMBsNiMIAn379+X68dezcf03nD0rmef8iko2nqlgbEIckergR87+XMKqomLMOi3Z0f6tZFtVgGTgS+BWt6B3lJE3hw9mqMK5+0i1SprIkaEwhecvcM+GPL4pLfPI+vXry1vv/Ja+/ftdcbwgCJjMJgyRDddnxMXHcceUXA4dOEhhoTSvcrKmlk+KTzIw2kKigsGqXPy5hDWnStl/vpoxCXHofDwAbVEBbgc+x6tCd2Jid5YOGaioYkepyf+kuISp327ldP2ULHfdcxeLli3GZDZdcbxKpcISbUHrxw3pdDom33YLep2OTd9uwul0NggVB4UgVATJJUz04RL+7ccltCUFcJv8ZXiZ/NkD+/FYWm9FeXklJt/qcDBn5x4W796HzRVbGwwG5i+cz/0P/gDRxzk0Wg3RMdGomlAuQRAYOnwYQ4YOZt3qNdTU1uIE1p8+w8HqC9JALQTzDW6XUG61eXIWVX5cQltRgF5Io3xPkWavSAPLRwxmZAhNfnFNLfdu2MLXJac9srTUVN54+y1yBuf4bGOIrPf3cumVlMQt37+N/K3bKCk5BcDBc+f5MoShokoQuKFbPH1MUawv9e8S2oIC3ILU+Z4ize/1SOC1odlNjmC9UWry/1tSyg82bqH4Qv06yMm3Tmbpr5YRGxt7xfGCIGC2mDEYmrceMyoqijum5FJVWUnBzgJAChX/XlRMT2MkGSEIFQHSTVFM6NGNbeVXuoRhXWLRiWKrKYAaWIyU3NGDZLpnZWbwRHpKyEy+e8nW3J27uVQnmXydXscLc1/g0RnTUfsYpatUKqKjo9Fo5ZeQ+UKlUjFu/PUkeYWKNoeDz06UcKHOwci4GEXRjVxitFpyk3pQcZlL+HtRMRqVim31eY61KFSAZhfGIhVpjvIIDBEsGZJFapRR0Yki1SrZoVVJ7UVm5O1gu1diJykpicXLFpOSluqzjVarxWxRZvLlsH/v/3j04ekcOVxfAjY4NoYVIwaFZFbRzSfFJTyfv4tqm89UteKKoOZYgAlIJj/dLRjfvSuvD8shQS+/YkepyV9/uoz7vsnj8Plqj2z8+Bt4bfnrdO2W4LONIdKAyWwKeucDdImLI3dKLocPHuLQoUIASmqlUHGAxUzPyGAv/ZfIcLmErV4uwYuNwBofzfyiRAHUSDttvIVr+lYrivy0fzpPZ6SGzOTXOZ38at8hZuV/R629TroRtZpnn5vJUz/9sU+zHqi/l4tOp2PSbZOJ0OvZtLE+VPw4xKGiL5fgYhhwBmmyTRZy7687kskf7RYkGiJYOGggfc3KBj9KTH75JStPbtnRILGT0C2BxUsX039Aps82KpUKi8WCSt2yM92bNn7L49Mfp+xM/b3enNiNJYMHEhWC7KEbPy7hL8AjQLXvVvXIUYAbkLZaiXcLxiXEMyern6IvJgoCZpkVOwBbyyuZkZffILEz+trRzFvwss/EDkhPZKhMvhxOlZziR9Oms31bvkeWEmVk5cgh9Im6cv4hWBRWX+DxvB3sPdvAGhxAWpuws7G2jT0mauAl4LdIy7JQCQL/1z+dn/RLU5QAUWLyncCKA4f58dadnHdptUqlYsaTj/P8C8+j8zPAioyMJMoU1WqdD2CMMpJ7151Un69mR760LqPCauVvR4/TK4Shoh+XEItUbteoS/CnAN2BfwAP4LISCRERLB+ew9iEeD9NfKMksVNls/HElp28X3gUd5lmXJcuvLb8V9w08Safbdz+PiIE+fnmIIoi1427jt59erN+7XpsNht2p5PPXLOKo+JiQxIqqkWRG7rF09sUxYZST8WRGpiMVGL/BdJClQb4upMrTP61CXG8lNU/pCa/oLKKGXn5HPdK7AwZOoQFr77iM7EDoFKrsJhb3t/L5dCBg0z74cMcbuFQUYlL8P7l1Ehx5Eq8TP7T/dKY2S89ZCYf4P3CIp7Iy6dS2oYFQRCY9ug05r78os+5e5D8vSXagtiMOrqWIiY2ljvvnkLR0aMc2H8AkELFj4+fYGB06EJFt0sol+ESvBXgPeApXFYhXq/n9WE5jO/WFSUoMfnVdjs/2VbAigOF9XP3FjNLX1vGbXd83+85jEZjs/293W5n7eq1fPi3VXz+ny/Ys3sPGq2Gbt26KT6XHLRaqdDEGBnJtxu/xeFwUGOvC3mo6HYJyVFG1p8uc0+UuV1CFa7dztzXnoIU5gFwdXwXXs7ur2j1rVKTv7fqPE/k5XPIK7EzcOAAFi5bTNeuvpVOEATMZjPaZk6+rF+7nhdm/YyjR49e8W/DRwxnyWtLSb4quVnnlsOWzVuY8ciPKC0t9cgm9Ehg2ZCskIaKhdUX+NHmfPZVnXOLrEgbXX0rIE3jHkEa+HF7r0RmD8jweSJ/aEURk0Ytu2RqVVExP9uxm9q6Oo/s3vvv5alnnvaZyweXv7dYmpzC9ce//vEpT854kjqva16OxWLho3993KBeMNicPnWaJ6c/zubNeR6ZVB85WHEaXQkX6+rIXbfZe3FKPjBYAO5FGvQRr9ex6rpRGBT8yEoSOxfr6phbsJe/HKnfycJoNDJ33lzG3XC933Z6vT6gEO/kiZOMvfo6amtrmzw2LT2NL9Z82WxFk4PdbmfhvFdYuWKlR2ZQq1k8eCC3JobGFQEUX6jlui/Xeq9JuEkFzMZVo/9gylWyN1lSmssvrL7AAxu3suZUvflLT0/nzbffJCsn2287Y5QRY5QxoPh+yaJX2bZlm6xjy8vLSUtNIb2vMiuoBFEUGTN2DGnpaaxdvRabzeaZVTxnt3N1iEJFk1ZDycVL3gNDu4iUPwZgVJzvcOtytKJIjFYj29//s7iEyau/aRCW3J57O+/+8T0Se/b02UYQBCzRlqDk87/+79fKjv9qdcDXlMPEWybx6eefkpLSxyN75+ARpqzPo/TKiZ6gcHOPBhZmhIjXhspJTYQloiCZfItWI8vf2xwOfl6wlyfy8j256oiICH7+8kvMnvszdDrfsbBarSYmNsZvvZ4SHA4HJcUnFLUpPnY84OvKJSUtlU+//HeDbWO3l1cwcfU3fHumvJGWzSPD1GCc0UvEazcpvZ+YWiMKRGnUxOp0sv19cU0tues28+6h+iRI8lXJvP+n3zHp1kl+2+n1eln1enIRRRG1QkXyp5ihIjIykt+sWM7P573oGQSfrr3IfRvyWHnwCMFcvH7ZYhNRxGsToxO1F4nRaaUFl2o1Zo2GOL2OaK2WCJVKdrz6VUkpE1d/02C37Qk3T+APf/kjfbzM3eUYo4whmczJUOjP+2b2D+r15SAIAg9Nn8ZfP/qrJwyuczp5eddeHt28nfNBWqt4pLrBqwROiYBndLSxtBy1IBChUmFQq9CpREVJijqnk4W79/Pwpm1UulbkaLVaZs+ZzfxFC4iI8J2vF0UxaP7eF7l33iH7WEEQuP3O20NyH3IYOnwYn339GSNGDPfIvjhxiltXb2TfucDfbrfBa2odyFcBEUi1/ByuvsCDfZKaNQItvXiJhzZt4x/H6v1tj8QeLH9rOdeMudZvO41GgyXagkZB0kkp/TL789UXX3LmTFmTx97/wP3cfd89IbsXORgiI/n+nbdTW1NL/nZparnCamVVUXFAs4o2h4Nn87+jqn4Dq1dVSJMEjwGGapsdpyBwtcxowM3G0jIe2LiV/VX1GjrmujG8/sbrdE/0/94CfYQes9nss3Y/mEjFnONY89UaKiv9bwIx/sbxLHltqd9kVEsiiiLXjh1DRt8M1n69BqvV6plVPGu3M7oZoeIb+wv5z4kS959ngUdUSLtJXgAmAmwvryTVFEWaqemslHurlZnbdzWYu3/6mR8z8/mZfgdTgiBI8b0xsPheCVEmE3fedSeiIHDkyBFqvGYd+/Tpzey5s3luzvMhtUTNITUtlQkTb2LLps2UlUkWbGfFWTaeqWBcQrzsQfm602eYlf+d94DyZ8A696+vRnqn3nVQX/jxWJr/RZyVVhtPb93JWq/ETlx8HIuWLiYrO8vvjYiiiMlsCkqI11wcDgfHjx2n6mwVXbt19Tv30Jaoranl2Wdm8snHn3hksXodvx6azegmNs5cVVTMc/nfeWcAvwXGAHbv3o1Hqij1rKJMMRl5oHcyV8fH0stgwIGT/eeqWXuqlN8XFlF2qT5ZMXz4MBa8uhBLIytZNRoNJrMppGnWjs77b7/H/JfmY7XW13ZMSe7JwylXNajPrHM6ySurYPn+QjacPuN9ikNInX8SriwIiUfawmyUt1AQBO9XqXH5v02bPo1HHnu0UV+uj9ATFdW6JVsdhe1btzPj0RmUnDzZQN41Qk9PQwR1TidHqms4a72iAGgfMB6v0N9Xb6iRXrY4C/BdfenF/EXzmXCz73ItqPf3/kLAMM2jvKycm26YwCnXWsUmsANvAz/lsncK+npk7cArQB/gcaSl3mVIGUM70m7XgNS5yVdd5eMUrpO74vtw5wef2C6xdOnS5KbZZUjrOHKQdhC/4oWSjQ0hy4A3XB9vEoASkN626S9kUqvVUslWK23X2glZirTVbgLSg3oMyd83SsABrz+frtPrwp3fslwEdrk+sgn3UCcnrACdnLACdHICUgBBEPz6+XC83z4ISAGcTme4o9s5AbsAfxZAFMLepT0QBAUIW4D2TPgx7eSEFaCTE1aATk5AqWBBEBD8DfZkDA1sVluDhZKhpmtCV1nlXrW1tRwrOuZ3CjxYREVF0aORkrmWICAFcDqdzc4DvLvibRYtWMTFS6FZAeMLQ0QEL7w0h/t/+AO/x3z4t1U8N/M5LoVoZc7lDBs+jPf//DuMxtAtDG2MgF2A4CcKaEwBDh04yEsvzmvRzgeoqa1lzvNz/K78qT5f3aKdD7Albwsr31zZ9IEhIuDZwObM+H23a7cnibR02VJ6dJdvBmc+O5Pjx46zePFikpKSmm7goqioiFmzZlFXV8fePXtJ7HXlmsSjhw97On9mZga9Qrzv0G/2F7K/6hx79+wJ6XUaI2T1z0Ijg4A6h7RG3+l0MmnSJNJS02Sfd/6C+RznON/73vfIyvJffHo5BQUFzJo1S7p+ncPnMU4veVaMhQyF6/VFAVSCiFoQUAkCoiCtohYFoYGpFQTp1/mza5l8Y3sWhJpWLYAXBAGHw3dntAcEpJXSOpWIVhRD8k6hUNP6KyDaIaIgEKlWoVewXrKtErKKoI6KwbUjSkf51gErgN8a/47yC7kQkHbYCMUrYlqTkH2bjmYZjBp1h+t8CMZsoJ9MYEdSAK0oynpHcXuk46l0CDBqOu5YudW/Wf62bZSXnmn6QBc1NdLahh35+VSfO9fE0fUcKixUfG8AOlGK6zsqrRoFOJ1O7rvff16+MaY+9FCzr6sEbRveizgYhC4KkEl2TraipWMFOwuoqalhYHYWkQq2lLlQU8Mu1+velKDkVTjtkZBZADmWQRAEPvjgAzLS5W/iNGDgAHZ/t5vfv/87xang7Gz/G1L6oyObfwiHgY0Sit062xod274FSHvM7SslZGXhHYFgdr/T9WlrBN57fn6ljuACgvkVFu3ex4SvNrC13P8uZa1B4BVBHaCj/RHMb1Zxycr/qs6x4tDRIJ41cMIK0Aht0WQHm47rwMPIIiQK0FGsQoirwtsEgWcCReWZQItF2kvQ6XSSm5uraHv2Qtebuu++525Fm0u75xCk65tltwsWJtd2+2Pi5L2RpaUISSq4KQsw6upRJCYmUlxczJ7dzauI3fe/fc1q16dPb3KGDJJ1bDANwAsD+/HCwH5trk6mVWYDDZEG/vn5P3l35bscb8G3cyQlJ/HQIw+j1+tlHe8Iog9oax3vJiQKIGcM0CUujmdnzwrF5cMoIGQrgzoCzk4QCIbDwEZwdPz+DytAZycgBegMO4QFcyDYFglIATrDfHlHJ5wJ7OSEFaCTE5ACqDtwMYibjj0CCHQQ2Ake9PAgsDE66HKpzkRYATo5ge0SVuegtqYG8TJFsNlsDV5r1l4oL69/Xft5m50qq40LdjvK3qAsn4uurWGsly5Relr5dnn2IL1QWikGwEZ9oWv40zY+TzXWaf5ojguoAT5qzsXChIwW75MY4DNaX+vDH+kNbjc23l3+CdS59QISAzxHmOZTA+xGek1cmDBhwoQJEyaMbP4fQ+/WJIM4ibgAAAAASUVORK5CYII=",
				defaultLocation: true
			}
		});

		await prisma.learningLocation.create({
			// IMG SRC: https://uxwing.com/study-group-icon/
			data: {
				id: "location-university",
				name: "Universität",
				iconURL:
					"data:image/png;base64,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",
				defaultLocation: true
			}
		});

		// Create Learning Diary Entries (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Diary Entry");
		const diaryEntry1 = await prisma.learningDiaryPage.create({
			data: {
				id: "diary-entry-advanced-spells",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied advanced spells",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 3,
				scope: 5,
				learningLocationId: location1.id,
				createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30))
			}
		});

		const diaryEntry2 = await prisma.learningDiaryPage.create({
			data: {
				id: "diary-entry-basic-potions",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied basic potions",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 1,
				effortLevel: 4,
				scope: 6,
				learningLocationId: location2.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const emptyDiaryEntry = await prisma.learningDiaryPage.create({
			data: {
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 0,
				effortLevel: 0,
				scope: 5,
				learningLocationId: null,
				createdAt: getRandomCreatedAt()
			}
		});

		// Additional hard-coded entries
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Additional Learning Diary Entries");
		const additionalEntry1 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry3",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied defensive spells",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 3,
				scope: 4,
				learningLocationId: location3.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const additionalEntry2 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry4",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied magical creatures",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 1,
				effortLevel: 5,
				scope: 7,
				learningLocationId: location2.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const additionalEntry3 = await prisma.learningDiaryPage.create({
			data: {
				id: "entry5",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied advanced charms",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 2,
				effortLevel: 4,
				scope: 6,
				learningLocationId: location1.id,
				createdAt: getRandomCreatedAt()
			}
		});

		const entryOverTwoDays = await prisma.learningDiaryPage.create({
			data: {
				id: "entry-over-two-days",
				studentName: student.username,
				courseSlug: getRandomElementFromArray(courses).slug || DEFAULT_SLUG,
				notes: "Studied transfiguration over two days",
				totalDurationLearnedMs: getRandomTimeIntervalInMs(),
				distractionLevel: 3,
				effortLevel: 4,
				scope: 8,
				learningLocationId: location3.id,
				createdAt: getRandomCreatedAt()
			}
		});

		// Create Learning Goals (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Goals");
		const learningGoal1 = await prisma.learningGoal.create({
			data: {
				description: "Learn TypeScript",
				status: "ACTIVE",
				username: student.username,
				createdAt: new Date(),
				children: {
					create: [
						{
							description: "Understand basic types",
							status: "ACTIVE",
							createdAt: new Date(),
							username: student.username
						},
						{
							description: "Learn about interfaces",
							status: "INACTIVE",
							createdAt: new Date(),
							username: student.username
						}
					]
				}
			}
		});

		const learningGoal2 = await prisma.learningGoal.create({
			data: {
				description: "Master Prisma",
				status: "INACTIVE",
				username: student.username,
				createdAt: new Date(),
				children: {
					create: [
						{
							description: "Understand relations",
							status: "ACTIVE",
							createdAt: new Date(),
							username: student.username
						},
						{
							description: "Learn about migrations",
							status: "INACTIVE",
							createdAt: new Date(),
							username: student.username
						}
					]
				}
			}
		});

		const learningGoal3 = await prisma.learningGoal.create({
			data: {
				description: "Understand SQL",
				status: "INACTIVE",
				username: student.username,
				createdAt: new Date(),
				children: {
					create: [
						{
							description: "Learn basic SQL commands",
							status: "ACTIVE",
							createdAt: new Date(),
							username: student.username
						},
						{
							description: "Learn joins",
							status: "INACTIVE",
							createdAt: new Date(),
							username: student.username
						}
					]
				}
			}
		});

		const learningGoal4 = await prisma.learningGoal.create({
			data: {
				description: "Learn Docker",
				status: "ACTIVE",
				username: student.username,
				createdAt: new Date(),
				children: {
					create: [
						{
							description: "Understand containers",
							status: "ACTIVE",
							createdAt: new Date(),
							username: student.username
						},
						{
							description: "Learn Dockerfile basics",
							status: "INACTIVE",
							createdAt: new Date(),
							username: student.username
						}
					]
				}
			}
		});

		const learningGoal5 = await prisma.learningGoal.create({
			data: {
				description: "Learn Git and GitHub",
				status: "COMPLETED",
				username: student.username,
				createdAt: new Date(),
				children: {
					create: [
						{
							description: "Understand version control",
							status: "COMPLETED",
							createdAt: new Date(),
							username: student.username
						},
						{
							description: "Learn branching strategies",
							status: "COMPLETED",
							createdAt: new Date(),
							username: student.username
						}
					]
				}
			}
		});

		// Create Learning Technique Evaluations (hard-coded)
		console.log(" - %s\x1b[32m ✔\x1b[0m", "Learning Technique Evaluations");
		const evaluation1 = await prisma.techniqueRating.create({
			data: {
				score: 4,
				techniqueId: technique1.id,
				diaryPageId: diaryEntry1.id,
				creatorName: student.username
			}
		});

		const evaluation2 = await prisma.techniqueRating.create({
			data: {
				score: 2,
				techniqueId: technique2.id,
				diaryPageId: diaryEntry2.id,
				creatorName: student.username
			}
		});
	} catch (error) {
		console.error("Error generating demo data:", error);
	} finally {
		await prisma.$disconnect();
	}
}
