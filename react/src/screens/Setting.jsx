import React, { useState, useEffect } from "react";
import { Button, Dropdown, Loader, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TextField } from "monday-ui-react-core";
import "monday-ui-react-core/dist/main.css";
import { monday, MondayDb } from "../services/Monday";
const db = new MondayDb('jetappConfig'); // create a db insance its simillar to create a table on rds.
const Setting = () => {
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState({});
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState({});
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [status, setStatus] = useState('Duplicate');
    const [configurations, setConfigurations] = useState([]);
    const [loadingColumns, setLoadingColumns] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        // Fetch boards
        monday.api(`query { boards { id name } }`)
            .then((res) => {
                setBoards(res.data.boards);
            })
            .catch((err) => {
                console.error(err);
            });
        updateConfigFromDb();
    }, []);

    useEffect(() => {
        // Fetch columns and groups when a board is selected
        if (Object.keys(selectedBoard).length != 0) {
            setLoadingColumns(true);
            monday.api(`query { boards (ids: ${selectedBoard.value}) { columns (types:[status,email,numbers]) { id title } } }`)
                .then((res) => {
                    setColumns(res.data.boards[0].columns);
                    setLoadingColumns(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingColumns(false);
                });
            setLoadingGroups(true);
            monday.api(`query { boards (ids: ${selectedBoard.value}) { groups { title id }}}`)
                .then((res) => {
                    setGroups(res.data.boards[0]?.groups);
                    setLoadingGroups(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingGroups(false);
                });
        }
    }, [selectedBoard]);
    /* Info : Update data to db and take corresponding action on state too to preent extra get api calls to database */
    const handleAddConfiguration = () => {
        setLoadingData(true);
        if (Object.keys(selectedBoard).length != 0 && Object.keys(selectedColumn).length != 0 && Object.keys(selectedGroup).length != 0) {
            let data = { board: selectedBoard, column: selectedColumn, group: selectedGroup, status: status };
            db.create(data)
                .then((result) => {
                    if (result.success) {
                        setConfigurations([
                            ...configurations,
                            data
                        ]);
                    }
                    setLoadingData(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingData(false);
                });
        }
        // Reset selection
        setSelectedBoard({});
        setSelectedColumn({});
        setSelectedGroup({});



    };

    const handleRemoveConfiguration = (index) => {
        setLoadingData(true);
        db.deleteByIndex(index)
            .then((result) => {
                if (result.success) {
                    const newConfigurations = [...configurations];
                    newConfigurations.splice(index, 1);
                    setConfigurations(newConfigurations);
                }
                else {
                    alert(result.message);
                }
                setLoadingData(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingData(false);
            });

    };

    const updateConfigFromDb = () => {
        setLoadingData(true);
        db.get()
            .then((result) => {
                if (result.success) {
                    console.log(result);
                    setConfigurations(result.data);
                }
                setLoadingData(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingData(false);
            });

    }

    return (
        <div className="App">
            <div className="container">
                <h1 style={{ alignSelf: "flex-start" }}>Duplicate Management Configuration</h1>
                <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                    <h3>Select Board</h3>
                    <Dropdown
                        placeholder="Select Board"
                        options={boards.map((board) => ({
                            label: board.name,
                            value: board.id
                        }))}
                        onChange={(selectedValue) => selectedValue ? setSelectedBoard(selectedValue) : setSelectedBoard({})}
                    />

                    {Object.keys(selectedBoard).length != 0 && (
                        <>
                            <h4>Select column where duplicates will detected (staus, email and numbers type only)</h4>
                            {loadingColumns ? (
                                <Loader color="PRIMARY" size={16} />
                            ) : (
                                <Dropdown
                                    placeholder="Select Column"
                                    options={columns.map((column) => ({
                                        label: column.title,
                                        value: column.id
                                    }))}
                                    onChange={(selectedValue) => selectedValue ? setSelectedColumn(selectedValue) : setSelectedColumn({})}
                                />
                            )}
                        </>
                    )}

                    {Object.keys(selectedColumn).length != 0 && (
                        <>
                            <h4>Select group to copy duplicate item</h4>
                            {loadingGroups ? (
                                <Loader color="PRIMARY" size={16} />
                            ) : (
                                <Dropdown
                                    placeholder="Select Group"
                                    options={groups.map((group) => ({
                                        label: group.title,
                                        value: group.id
                                    }))}
                                    onChange={(selectedValue) => selectedValue ? setSelectedGroup(selectedValue) : setSelectedGroup({})}
                                />
                            )}
                        </>
                    )}
                    {Object.keys(selectedGroup).length != 0 && (
                        <>
                            <h4>Status value to identify duplicate </h4>
                            <TextField
                                title="*if selected column's board have a status column type"
                                value={status}
                                onChange={(selectedValue) => setStatus(selectedValue)}
                            />

                        </>
                    )}

                    <Button
                        size="large"
                        kind="primary"
                        onClick={handleAddConfiguration}
                        disabled={!(Object.keys(selectedGroup).length)}
                        style={{ marginTop: "16px", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                    >
                        Add Configuration
                    </Button>
                </div>

                <div className="configuration-table" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                    <h2>Configurations</h2>
                    <Table style={{
                        width: "auto"
                    }} size={Table.sizes.MEDIUM} columns={['Board', 'Column', 'Duplicate Group', 'Status Text', 'Action']} dataState={{ isLoading: loadingData }}>
                        <TableHeader>
                            <TableHeaderCell title="Board" />
                            <TableHeaderCell title="Column" />
                            <TableHeaderCell title="Duplicate Group" />
                            <TableHeaderCell title="Status Text" />
                            <TableHeaderCell title="Action" />
                        </TableHeader>
                        <TableBody>
                            {configurations.map((config, index) => (
                                <TableRow key={index}>
                                    <TableCell>{config.board.label}</TableCell>
                                    <TableCell>{config.column.label}</TableCell>
                                    <TableCell>{config.group.label}</TableCell>
                                    <TableCell>{config.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            onClick={() => handleRemoveConfiguration(index)}
                                            kind="SECONDARY"
                                            style={{ backgroundColor: "red", color: "#fff", boxShadow: "none" }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Setting;
