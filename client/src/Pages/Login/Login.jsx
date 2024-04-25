import React, {useContext, useState} from 'react'
import './Login.css'
import '../../App.css'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from "../../context/authContext"

//import login assets
import video from '../../LoginAssets/video.mp4'
import logo from '../../LoginAssets/logo.png'

//imported icons
import {FaUserShield} from 'react-icons/fa'
import {BsFillShieldLockFill} from 'react-icons/bs'
import { AiOutlineSwapRight } from "react-icons/ai"

const Login = () => {
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });
    const [err, setErr] = useState(null);

    const navigate = useNavigate()

    const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const userData = await login(inputs);
        if (userData && userData.role === "admin"){
            navigate("/adminHome"); // Navigate to admin home page if the user is an admin
        } else {
            navigate("/"); // Navigate to regular home page for non-admin users
        }
    } catch (err) {
        setErr(err.response.data);
    }
    };

    return(
        <div className='loginPage flex'>
            <div className="container flex">

                <div className='videoDiv'>
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className='title'>Elevate Your Coding Journey with LearnYourCode</h2>
                        <p>"Your Ultimate Programming Community for Learning and Growing!"</p>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Don't have an account?</span>
                        <Link to={'/register'}>
                            <button className='btn'>Sign Up</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={logo} alt="Logo Image"/>
                        <h3>Welcome Back!</h3>
                    </div>

                    <form action="" className='form grid'>
                        <div className="inputDiv">
                            <label htmlFor='username'>Username</label>
                            <div className="input flex">
                                <FaUserShield className='icon'/>
                                <input type="text" name='username' placeholder='Username'
                                onChange={handleChange}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor='password'>Password</label>
                            <div className="input flex">
                                <BsFillShieldLockFill className='icon'/>
                                <input type="password" name='password' placeholder='Password'
                                onChange={handleChange}/>
                            </div>
                        </div>
                        {err && err}
                        <button type='submit' className='btn flex' onClick={handleLogin}>
                            <span>Login</span>
                            <AiOutlineSwapRight className='icon'/>
                        </button>
                    </form>
                </div>
            </div>    
        </div>
    )
}

export default Login