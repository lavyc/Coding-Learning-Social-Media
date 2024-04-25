import React from "react";
import "./guideline.scss";
import teamwork from '../../LoginAssets/teamwork.png';

const Guideline = ({ }) => {


    return (
        <div className="home">
            <div className="Gcontainer">
                <img src={teamwork} alt="" className="team" />
                <span>Our goal is to create a community 
                    with high-quality questions and answers 
                    to promote cooperation among members in a 
                    friendly, safe community that values compassion,
                    cooperation, and respect for one another.
                </span>
            </div>
            <div className="Rcontainer">
                <div className="text">Unacceptable Behaviour</div>

                <div className="abusive">
                    <p>Abusive behavior</p>
                    <span>Any form of harassment or content 
                        that promotes violence are prohibitted. 
                        Behavior that contributes
                         to an environment of exclusion or 
                         marginalization are not allowed.</span>
                </div>
                <div className="abusive">
                    <p>Sensitive Content & Imagery</p>
                    <span>Content that promotes suicidal or 
                        self-harming behaviors are prohibited, 
                        as well as content that or glorifies harm or cruelty.</span>
                </div>
                <div className="abusive">
                    <p>Harmful Political Content</p>
                    <span>Political content that advocates harm 
                        to others or advances the agenda of 
                        violent actors and 
                        hate groups.  are prohibited.</span>
                </div>
                <div className="abusive">
                    <p>Misleading Information</p>
                    <span>content that spreads false, harmful, or misleading 
                        information that could potentially harm 
                        individuals or groups are prohibited. Content that promotes
                         false or misleading information with the 
                         intention of advancing the agenda of a political party, 
                         government, or ideology are not permitted. </span>
                </div>
                <div className="abusive">
                    <p>Disruptive Use of Tooling</p>
                    <span>Misuse of privileges in a targeted 
                        and disruptive manner that harms the 
                        community or undermines the integrity of 
                        the content are not permitted. </span>
                </div>
            </div>
        </div>
    );
};

export default Guideline;
