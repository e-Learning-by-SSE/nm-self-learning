import React, { ErrorInfo } from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	errorMessage: string;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, errorMessage: "" };
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ hasError: true, errorMessage: error.message });
	}

	override render() {
		if (
			this.state.hasError &&
			this.state.errorMessage.match("An error occurred: Unknown language:")
		) {
			return <h1>An error occurred: {this.state.errorMessage}</h1>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
