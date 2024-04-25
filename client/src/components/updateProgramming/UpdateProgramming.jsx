import { useState } from "react";
import { makeRequest } from "../../axios";
import "./updateProgramming.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Multiselect } from 'multiselect-react-dropdown';
import Snackbar from '@mui/material/Snackbar';

const UpdateProgramming = ({ setOpenUpdatePrg, user }) => {
  const [programmingLevel, setProgrammingLevel]= useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /*const [texts] = useState({
    programmingLevel: user.programmingLevel,
  });*/

  const handleLevelChange = (event) => {
    const programmingLevel = event.target.value;
    setProgrammingLevel(programmingLevel); // Update state on dropdown selection
  };

  const skillsets= [
    {SkillSet:"Artificial Intelligence (AI)"},
    {SkillSet:"Technical Support"},
    {SkillSet:"Networking"},
    {SkillSet:"Cloud Computing"},
    {SkillSet:"Linux"},
    {SkillSet:"Programming Languages"},
    {SkillSet:"Web Development"},
    {SkillSet:"Quality Assurance"},
    {SkillSet:"User Experience (UX)"},
    {SkillSet:"Machine Learning"},
    {SkillSet:"Database Administration"},
    {SkillSet:"Data Analysis"},
    {SkillSet:"Data Visualization"},
    {SkillSet:"Data Science"},
    {SkillSet:"Big Data"},
    {SkillSet:"Information Security"},
    {SkillSet:"Risk Analysis"},
    {SkillSet:"Cybersecurity Analytics"},
    {SkillSet:"Penetration Testing"},
    {SkillSet:"Compliance"},
    {SkillSet:"Professional Skills"},
    {SkillSet:"Project Management"},
    {SkillSet:"Business Skills"},
    {SkillSet:"Automation"},
  ]

  const languages=[
    {Language:"HTML"},
    {Language:"React"},
    {Language:"Javascript"},
    {Language:"Python"},
    {Language:"Go"},
    {Language:"Java"},
    {Language:"Kotlin"},
    {Language:"PHP"},
    {Language:"C#"},
    {Language:"Swift"},
    {Language:"R"},
    {Language:"Ruby"},
    {Language:"C"},
    {Language:"C++"},
    {Language:"Matlab"},
    {Language:"Typescript"},
    {Language:"Scala"},
    {Language:"SQL"},
    {Language:"CSS"},
    {Language:"NoSQL"},
    {Language:"Rust"},
    {Language:"Perl"},
    {Language:"VB.NET"},
    {Language:"Apache Groovy"},
    {Language:"SAS"}
  ]

  const handleSkillChange = (selectedList) => {
    const selectedSkills = selectedList.map(skillsets => skillsets.SkillSet);
    if (selectedSkills.length <= 5) {
      setSelectedSkills(selectedSkills);
    }
    console.log("Selected Skills:", selectedSkills);
  };

  const handleLanguageChange = (selectedList) => {
    const programmingLanguages = selectedList.map(language => language.Language);
    if (programmingLanguages.length <= 5) {
      setProgrammingLanguages(programmingLanguages);
    }
    console.log("Selected Languages:", programmingLanguages); 
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (user) => {
      return makeRequest.put("/users/updateProgramming", user);
    },
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["user"]);
        setSnackbarMessage("Programming profile successfully updated!");
        setSnackbarOpen(true);
        console.log("Snackbar should be open now with success message.");
      },
      onError: (error) => {
        console.error(error);
        setSnackbarMessage("Error on Updating the Programming Profile!");
        setSnackbarOpen(true);
        console.log("Snackbar should be open now with error message.");
      },
    });

  const handleClick = async (e) => {
    e.preventDefault();

    mutation.mutate({
      programmingLevel: programmingLevel,
      programmingLanguages: programmingLanguages,
      selectedSkills: selectedSkills
    });
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="update">
      <div className="wrapper">
        <h1>Update Your Programming Skills</h1>
        <form>
          <label>Programming Level</label>
          <select id="programmingLevel" name="programmingLevel" 
          value={programmingLevel}
          onChange={handleLevelChange}>
            <option value="">---Select an option---</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label>Programming Languages (Maximum of 5 selections)</label>
          <div>
            <Multiselect options={languages}
              displayValue="Language" 
              id="programmingLanguages"
              name="programmingLanguages" 
              value={programmingLanguages}
              onSelect={handleLanguageChange}
              onRemove={handleLanguageChange} />
          </div>
          <label>Skillsets (Maximum of 5 selections)</label>
          <div>
            <Multiselect 
            options={skillsets} 
            displayValue="SkillSet" 
            id="selectedSkills"
            name="selectedSkills" 
            value={selectedSkills}
            onSelect={handleSkillChange}
            onRemove={handleSkillChange}/>
          </div>
          <button onClick={handleClick}>Update</button>
        </form>
        <button className="close" onClick={() => setOpenUpdatePrg(false)}>
          Close
        </button> 
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={4000} // Adjust as needed
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default UpdateProgramming;