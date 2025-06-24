import React from "react";
import WarehouseCanvas from "./components/WarehouseCanvas";
import { ToastContainer } from 'react-toastify';
import './App.css';

function App() {
    return (
        <div className="warehouse-container">
            <h1>Облачное складское хранение</h1>
            <WarehouseCanvas />
            <ToastContainer />
        </div>
    );
}

export default App;
