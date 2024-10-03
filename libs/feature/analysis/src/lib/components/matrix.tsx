import { forwardRef } from "react";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import type { ChartType, ChartComponentLike } from "chart.js";

import { ChartProps, ChartJSOrUndefined, TypedChartComponent } from "react-chartjs-2/dist/types";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, registerables } from "chart.js";
ChartJS.register(...registerables, MatrixController, MatrixElement, CategoryScale, LinearScale);

function createTypedChart<T extends ChartType>(type: T, registerables: ChartComponentLike) {
	return forwardRef<ChartJSOrUndefined<T>, Omit<ChartProps<T>, "type">>((props, ref) => (
		<Chart {...props} ref={ref} type={type} />
	)) as TypedChartComponent<T>;
}

/**
 * Defines a <Matrix> React component of the matrix chart extension
 * based on https://codesandbox.io/p/sandbox/react-typescript-forked-kffrov / https://github.com/reactchartjs/react-chartjs-2/issues/1112#issue-1457238798
 */
export const Matrix = createTypedChart("matrix", MatrixController);
