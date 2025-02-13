import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState, useEffect } from "react";
import { Radio } from "../components/Radio";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";

export function IntroSurvey({ next }) {
  const labelClassName = "block text-base font-medium text-gray-900 my-2";
  const player = usePlayer();

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [ethnicity, setEthnicity] = useState([]);
  const [education, setEducation] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [politicalAffiliation, setPoliticalAffiliation] = useState("");

  // Scroll to top on load
  useEffect(() => {
    document.getElementById("scroller").scroll(0, 0);
  }, []);

  const negateConsent = (event) => {
    event.preventDefault();
    player.set("consent", false);
    player.set("ended", "no consent");
  };

  function handleSubmit(event) {
    event.preventDefault();
    player.set("demographics", {
      gender,
      age,
      ethnicity,
      education,
      employmentStatus,
      politicalAffiliation,
    });
    next();
  }

  function handleGenderChange(e) {
    setGender(e.target.value);
  }

  function handleEthnicityChange(e) {
    if (e.target.checked) {
      setEthnicity(ethnicity.concat(e.target.value));
    } else {
      setEthnicity(ethnicity.filter((item) => item != e.target.value));
    }
  }

  function handleAgeChange(e) {
    setAge(e.target.value);
  }

  function handleEducationChange(e) {
    setEducation(e.target.value);
  }

  function handleEmploymentStatusChange(e) {
    setEmploymentStatus(e.target.value);
  }

  function handlePoliticalAffiliationChange(e) {
    setPoliticalAffiliation(e.target.value);
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <form
        className="mt-12 space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Intro Survey
              </h3>
              <p className="mt-1 text-base text-gray-500">
                First, we would like to ask you a few questions about yourself.
              </p>
            </div>

            <div className="space-y-8 mt-6">
              <div>
                <label className={labelClassName}>
                  <b>Gender: </b> Please specify your gender identity.
                </label>
                <div className="grid gap-2">
                  <Radio
                    selected={gender}
                    name="gender"
                    value="male"
                    label="Male"
                    onChange={handleGenderChange}
                  />
                  <Radio
                    selected={gender}
                    name="gender"
                    value="female"
                    label="Female"
                    onChange={handleGenderChange}
                  />
                  <Radio
                    selected={gender}
                    name="gender"
                    value="nonbinary"
                    label="Non binary / Non conforming"
                    onChange={handleGenderChange}
                  />
                  <Radio
                    selected={gender}
                    name="gender"
                    value="other"
                    label="Other"
                    onChange={handleGenderChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  <b>Age:</b> Please specify your age range.
                </label>
                <div className="grid gap-2">
                  <Radio
                    selected={age}
                    name="age"
                    value="18-24"
                    label="18-24"
                    onChange={handleAgeChange}
                  />
                  <Radio
                    selected={age}
                    name="age"
                    value="25-34"
                    label="25-34"
                    onChange={handleAgeChange}
                  />
                  <Radio
                    selected={age}
                    name="age"
                    value="35-44"
                    label="35-44"
                    onChange={handleAgeChange}
                  />
                  <Radio
                    selected={age}
                    name="age"
                    value="45-54"
                    label="45-54"
                    onChange={handleAgeChange}
                  />
                  <Radio
                    selected={age}
                    name="age"
                    value="55-64"
                    label="55-64"
                    onChange={handleAgeChange}
                  />
                  <Radio
                    selected={age}
                    name="age"
                    value="65+"
                    label="65+"
                    onChange={handleAgeChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  <b>Ethnicity: </b> Please specify your ethnicity (select all
                  that apply).
                </label>
                <div className="grid gap-2">
                  <Checkbox
                    name="white"
                    value="white"
                    label="White / Caucasian"
                    onChange={handleEthnicityChange}
                  />
                  <Checkbox
                    name="latino"
                    value="latino"
                    label="Hispanic or Latinx"
                    onChange={handleEthnicityChange}
                  />
                  <Checkbox
                    name="black"
                    value="black"
                    label="Black or African American"
                    onChange={handleEthnicityChange}
                  />
                  <Checkbox
                    name="native-american"
                    value="native-american"
                    label="Native American or American Indian"
                    onChange={handleEthnicityChange}
                  />
                  <Checkbox
                    name="asian"
                    value="asian"
                    label="Asian / Pacific Islander"
                    onChange={handleEthnicityChange}
                  />
                  <Checkbox
                    name="other"
                    value="other"
                    label="Other"
                    onChange={handleEthnicityChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  <b>Education: </b> What is the highest degree or level of
                  school you have completed? If you are currently enrolled,
                  select the highest degree you have received.
                </label>
                <div className="grid gap-2">
                  <Radio
                    selected={education}
                    name="education"
                    value="no-degree"
                    label="No degree"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="high-school"
                    label="High School"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="vocational"
                    label="Trade/technical/vocational training"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="bachelor"
                    label="Bachelor's Degree"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="master"
                    label="Master's Degree"
                    onChange={handleEducationChange}
                  />
                  <Radio
                    selected={education}
                    name="education"
                    value="phd"
                    label="Doctorate degree or higher"
                    onChange={handleEducationChange}
                  />
                </div>
              </div>

              {["mturk", "prolific"].includes(player.get("platform")) ? (
                <div>
                  <div>
                    <label className={labelClassName}>
                      <b>Employment Status: </b> What currently describes at
                      best your employment status?
                    </label>
                    <div className="grid gap-2">
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="student"
                        label="Student"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="unemployed-looking"
                        label="Unemployed (currently looking for work)"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="unemployed-notlooking"
                        label="Unemployed (not currently looking for work)"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="employed-wages"
                        label="Employed for wages"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="self-employed"
                        label="Self-employed"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="retired"
                        label="Retired"
                        onChange={handleEmploymentStatusChange}
                      />
                      <Radio
                        selected={employmentStatus}
                        name="employmentStatus"
                        value="other"
                        label="Other"
                        onChange={handleEmploymentStatusChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>
                      <b>Political orientation: </b> In politics today, how do
                      you generally describe yourself?
                    </label>
                    <div className="grid gap-2">
                      <Radio
                        selected={politicalAffiliation}
                        name="politicalAffiliation"
                        value="republican"
                        label="Republican"
                        onChange={handlePoliticalAffiliationChange}
                      />
                      <Radio
                        selected={politicalAffiliation}
                        name="politicalAffiliation"
                        value="democrat"
                        label="Democrat"
                        onChange={handlePoliticalAffiliationChange}
                      />
                      <Radio
                        selected={politicalAffiliation}
                        name="politicalAffiliation"
                        value="independent"
                        label="Independent"
                        onChange={handlePoliticalAffiliationChange}
                      />
                      <Radio
                        selected={politicalAffiliation}
                        name="politicalAffiliation"
                        value="not-sure"
                        label="Don't know / Not sure"
                        onChange={handlePoliticalAffiliationChange}
                      />
                      <Radio
                        selected={politicalAffiliation}
                        name="politicalAffiliation"
                        value="other"
                        label="Other"
                        onChange={handlePoliticalAffiliationChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="mb-12">
                <div className="mb-2">
                  <Button type="submit">Continue</Button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={negateConsent}
                    className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-empirica-500 border-transparent shadow-sm text-white bg-red-500 hover:bg-red-600"
                    autoFocus={false}
                  >
                    Withdraw from the experiment (I do not wish to provide some
                    of the required information)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
