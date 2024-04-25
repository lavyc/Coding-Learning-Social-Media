import React, {useState} from 'react'
import './Register.css'
import '../../App.css'
import { Link } from 'react-router-dom'
import Axios from "axios";

//import Register assets
import video from '../../LoginAssets/video.mp4'
import logo from '../../LoginAssets/logo.png'

//imported icons
import {FaUserShield} from 'react-icons/fa'
import {BsFillShieldLockFill} from 'react-icons/bs'
import { AiOutlineSwapRight } from "react-icons/ai"
import { MdMarkEmailRead } from "react-icons/md";
import { FaUser } from "react-icons/fa";


const Register = () => {
    const [inputs, setInputs] = useState({
        email: "",
        username: "",
        password: "",
    });
    const [err, setErr] = useState(null);

    const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    //OnCLick will get the input entered
    const handleClick = async (e) => {
        e.preventDefault();

        // Check if any input field is empty
        if (!inputs.email || !inputs.username || !inputs.password) {
            setErr("All fields are required.");
            return; // Exit early if any field is empty
        }

        try {
            // Log the response data from the server
            const response = await Axios.post("http://localhost:8800/api/auth/register", inputs);
            console.log(response.data);
            setErr(response.data);
        } catch (err) {
            setErr(err.response.data);
        }
    };

    console.log(err)
  

    return(
        <div className='registerPage flex'>
            <div className="container flex">

                <div className='videoDiv'>
                    <video src={video} autoPlay muted loop></video>

                    <div className="textDiv">
                        <h2 className='title'>Elevate Your Coding Journey with LearnYourCode</h2>
                        <p>"Your Ultimate Q&A Platform for Learning and Growing!"</p>
                    </div>

                    <div className="footerDiv flex">
                        <span className="text">Have an account?</span>
                        <Link to={'/Login'}>
                            <button className='btn'>Login</button>
                        </Link>
                    </div>
                </div>

                <div className="formDiv flex">
                    <div className="headerDiv">
                        <img src={logo} alt="Logo Image"/>
                        <h3>Let Us Know You!</h3>
                    </div>

                    <form action="" className='form grid'>

                        <div className="inputDiv">
                            <label htmlFor='email'>Email</label>
                            <div className="input flex">
                                <MdMarkEmailRead className='icon'/>
                                <input type="email" name='email' placeholder='Email'
                                onChange={handleChange}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor='username'>Username</label>
                            <div className="input flex">
                                <FaUserShield className='icon'/>
                                <input type="text" name='username' placeholder='Username'
                                onChange={handleChange}/>
                            </div>
                        </div>

                        <div className="inputDiv">
                            <label htmlFor='name'>Name</label>
                            <div className="input flex">
                                <FaUser className='icon'/>
                                <input type="name" name='name' placeholder='Name'
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
                        <button onClick={handleClick} className='btn flex'>
                            <span>Register</span>
                            <AiOutlineSwapRight className='icon'/>
                        </button>
                    </form>
                </div>
            </div>    
        </div>
    )
}

export default Register