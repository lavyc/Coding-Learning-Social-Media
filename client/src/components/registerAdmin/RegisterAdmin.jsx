import React from "react";
import "./registerAdmin.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import AddAdmin from "../addAdmin/AddAdmin";
import DeleteAdmin from "../deleteAdmin/DeleteAdmin";
import { useState } from "react";

const RegisterAdmin = () => {
    const [openRegAdmin, setOpenRegAdmin] = useState(false);
    const [openDelAdmin, setOpenDelAdmin] = useState(false);

    const { isLoading, error, data: adminUsers } = useQuery({
        queryKey:["adminUsers"],
        queryFn: () => {
            return makeRequest.get("/admins/getAdmin").then((res) => {
                return res.data
            });
        }
    });

    const handleRegisterAdmin = async () => {
        setOpenRegAdmin(true);
    };

    const handleDeleteAdmin = async () => {
        setOpenDelAdmin(true);
    };

    return (
        <div className="home">
            <div className="container">
                <div className="register-new-admin-button">
                    <button onClick={handleRegisterAdmin}>Register New Admin</button>
                </div>
                <div className="delete-admin-button">
                    <button onClick={handleDeleteAdmin}>Delete Admin</button>
                </div>
                {isLoading && <div>Loading...</div>}
                {error && <div>Error fetching admin users: {error.message}</div>}
                {!isLoading && !error && (
                    adminUsers.length === 0 ? (
                        <div>No admin available.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminUsers.map((adminUser) => (
                                    <tr key={adminUser.id}>
                                        <td>{adminUser.id}</td>
                                        <td>{adminUser.email}</td>
                                        <td>{adminUser.username}</td>
                                        <td>{adminUser.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
            {openRegAdmin && <AddAdmin setOpenRegAdmin={setOpenRegAdmin} />}
            {openDelAdmin && <DeleteAdmin setOpenDelAdmin={setOpenDelAdmin} />}
        </div>
    );
};

export default RegisterAdmin;
