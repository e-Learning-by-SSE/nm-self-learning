import axios from "axios";

export async function loginAsAdmin() {
	const response = await axios.post("http://localhost:1337/api/auth/local", {
		identifier: "admin",
		password: "strapiTest1"
	});

	return response;
}
