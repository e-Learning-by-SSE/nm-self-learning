import { Toast } from "./toast";

export default {
	title: "Common/Toast"
};

export const Success = () => (
	<Toast
		id="1"
		type="success"
		title="Course created!"
		subtitle="Introduction to Machine Learning"
	/>
);

export const Info = () => (
	<Toast
		id="1"
		type="info"
		title="Did you know?"
		subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas temporibus quos laborum rerum eum natus!"
	/>
);

export const Error = () => (
	<Toast id="1" type="error" title="Operation failed!" subtitle="Something went wrong." />
);

export const Warning = () => (
	<Toast
		id="1"
		type="warning"
		title="Attention"
		subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas temporibus quos laborum rerum eum natus!"
	/>
);
