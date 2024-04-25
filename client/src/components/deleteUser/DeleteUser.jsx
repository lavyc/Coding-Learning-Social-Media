import React from "react";
import "./deleteUser.scss";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteUserForm from "../deleteUserForm/DeleteUserForm";

const DeleteUser = ({ }) => {
    const [openDelUser, setOpenDelUser] = useState(false);

    const { isLoading, error, data: users } = useQuery({
        queryKey:["users"],
        queryFn: () => {
            return makeRequest.get("/admins/getUsers").then((res) => {
                return res.data
            });
        }
    });

    const handleDeleteUser = async () => {
        setOpenDelUser(true);
    };

    return (
        <div className="home">
            <div className="container">
                <div className="delete-button">
                    <button onClick={handleDeleteUser}>Delete User</button>
                </div>
                {isLoading && <div>Loading...</div>}
                {error && <div>Error fetching admin users: {error.message}</div>}
                {!isLoading && !error && (
                    users.length === 0 ? (
                        <div>No admin available.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cover Picture</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Programming Level</th>
                                    <th>Programming Language</th>
                                    <th>Skillset</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((users) => (
                                    <tr key={users.id}>
                                        <td>{users.id}</td>
                                        <td>{users.profilePic ? (
                                            <img src={"/upload/" + users.profilePic} alt=""/>
                                        ) : (
                                            <div className="profilePic">
                                                < AccountCircleIcon className="profilePic" />
                                            </div>
                                        )}</td>
                                        <td>{users.email}</td>
                                        <td>{users.username}</td>
                                        <td>{users.name}</td>
                                        <td>{users.programmingLevel}</td>
                                        <td>{users.languages}</td>
                                        <td>{users.skillsets}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
            {openDelUser && <DeleteUserForm setOpenDelUser={setOpenDelUser} />}
        </div>
    );
};

export default DeleteUser;
