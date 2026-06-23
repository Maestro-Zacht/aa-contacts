import DataTable from 'datatables.net-react';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-columncontrol-bs5';

import "./DataTables.css";

// DataTable.use() is the datatables.net-react registration API, not a React hook.
// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DataTablesCore);

export default DataTable;
