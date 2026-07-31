/** Matrix render core — composes filter + table script segments. */
import { MATRIX_RENDER_FILTERS_SCRIPT } from "./matrix-render-filters";
import { MATRIX_RENDER_TABLE_SCRIPT } from "./matrix-render-table";

export const MATRIX_RENDER_SCRIPT = MATRIX_RENDER_FILTERS_SCRIPT + MATRIX_RENDER_TABLE_SCRIPT;
