import "./Drum.css";
import { useState, useEffect, useRef } from "react";
import { FaPowerOff, FaPlay, FaFileDownload } from "react-icons/fa";
import { PiRecordFill } from "react-icons/pi";
import { BsPauseFill } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { TiDelete } from "react-icons/ti";
import { LuImport } from "react-icons/lu";

export default function Drum() {
  const [toggle, setToggle] = useState(true);
  const [vol, setVol] = useState(1);
  const [disp, setDisplay] = useState("");
  const [pause, setPause] = useState(false);
  const [songList, setSong] = useState([]);
  const recording = useRef(false);
  const startTime = useRef(0);
  const notes = useRef([]);
  const timeRemaining = useRef(0);
  const tempTime = useRef(0);
  const timeOuts = useRef([]);
  const picking = useRef(0);
  const [recordName, setRecord] = useState("");

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (
        e.key == "q" ||
        e.key == "w" ||
        e.key == "e" ||
        e.key == "a" ||
        e.key == "s" ||
        e.key == "d" ||
        e.key == "z" ||
        e.key == "x" ||
        e.key == "c"
      ) {
        willPress(e.key);
        playSound(e.key);
      }
    });
    return () => {
      document.removeEventListener("keydown", (e) => {
        if (
          e.key == "q" ||
          e.key == "w" ||
          e.key == "e" ||
          e.key == "a" ||
          e.key == "s" ||
          e.key == "d" ||
          e.key == "z" ||
          e.key == "x" ||
          e.key == "c"
        ) {
          willPress(e.key);
          playSound(e.key);
        }
      });
    };
  }, []);

  useEffect(() => {
    const localData = window.localStorage.getItem("MYSONGS");
    console.log(localData);
    if (localData !== null) setSong(JSON.parse(localData));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("MYSONGS", JSON.stringify(songList));
  }, [songList]);

  useEffect(() => {
    [...document.querySelectorAll(".drum-pad")].forEach((item) => {
      item.addEventListener("click", (e) => {
        willPress(e.target.firstChild.id);
        playSound(e.target.firstChild.id);
      });
    });
    return () => {
      [...document.querySelectorAll(".drum-pad")].forEach((item) => {
        item.removeEventListener("click", (e) => {
          willPress(e.target.firstChild.id);
          playSound(e.target.firstChild.id);
        });
      });
    };
  }, []);

  const playSound = (event) => {
    if (recording.current) {
      const data = {
        key: event.toUpperCase(),
        start: Date.now() - startTime.current,
        last: false,
      };
      notes.current = [...notes.current, data];
    }
    const audio = document.getElementById(event.toUpperCase());
    setDisplay(audio.parentElement.id);
    const loudness = document.getElementById("volume").value;
    audio.volume = loudness;
    audio.currentTime = 0;
    audio.play();
  };

  const willToggle = () => {
    if (toggle) {
      setToggle(false);
      notes.current = [];
      recording.current = false;
      setPause(false);
      for (var i = 0; i < timeOuts.current.length; i++) {
        clearTimeout(timeOuts.current[i]);
      }
      timeOuts.current = [];
      timeRemaining.current = 0;
    } else {
      setToggle(true);
    }
  };

  const handleFocus = () => {
    setToggle(false);
    notes.current = [];
    recording.current = false;
    setPause(false);
    for (var i = 0; i < timeOuts.current.length; i++) {
      clearTimeout(timeOuts.current[i]);
    }
    timeOuts.current = [];
    timeRemaining.current = 0;
  };

  const willPress = (event) => {
    document.getElementById(event.toUpperCase()).parentElement.className =
      "drumPress";
    setTimeout(() => {
      document.getElementById(event.toUpperCase()).parentElement.className =
        "drum-pad";
    }, 100);
  };

  const record = () => {
    if (!toggle) {
      return;
    }
    if (!recording.current) {
      document.getElementById("record").classList.toggle("restate");
      startTime.current = Date.now();
      notes.current = [];
      recording.current = true;
    } else {
      document.getElementById("record").classList.toggle("restate");
      recording.current = false;
      notes.current[notes.current.length - 1].last = true;
      if (recordName.length == 0) {
        notes.current = [
          ...notes.current,
          { name: "Unnamed " + (songList.length + 1) },
        ];
      } else {
        notes.current = [...notes.current, { name: recordName }];
      }
      setSong((prev) => [...prev, notes.current]);
    }
  };

  const playBack = () => {
    if (!toggle || recording.current || songList.length === 0) {
      return;
    }
    tempTime.current = Date.now();
    setPause(true);
    const test = songList[picking.current];
    test.forEach((note) => {
      if (!note.name) {
        if (note.start > timeRemaining.current) {
          if (note.last) {
            timeOuts.current = [
              ...timeOuts.current,
              setTimeout(() => {
                setPause(false);
                timeRemaining.current = 0;
                timeOuts.current = [];
                willPress(note.key);
                playSound(note.key);
              }, note.start - timeRemaining.current),
            ];
          } else {
            timeOuts.current = [
              ...timeOuts.current,
              setTimeout(() => {
                willPress(note.key);
                playSound(note.key);
              }, note.start - timeRemaining.current),
            ];
          }
        }
      }
    });
  };

  const paused = () => {
    const elapsed = Date.now() - tempTime.current;
    setPause(false);
    for (var i = 0; i < timeOuts.current.length; i++) {
      clearTimeout(timeOuts.current[i]);
    }
    timeRemaining.current = timeRemaining.current + elapsed;
    timeOuts.current = [];
  };

  const dropdown = () => {
    document.getElementById("drop").classList.toggle("dropRotate");
    document.getElementById("formDrop").classList.toggle("hide");
  };

  const chooseSong = (event) => {
    const chosen = songList[event.currentTarget.dataset.select];
    setDisplay(chosen[chosen.length - 1].name);
    picking.current = event.currentTarget.dataset.select;
    for (var i = 0; i < timeOuts.current.length; i++) {
      clearTimeout(timeOuts.current[i]);
    }
    setPause(false);
    timeOuts.current = [];
    timeRemaining.current = 0;
  };

  const deleteSong = (event) => {
    const selection = event.currentTarget.dataset.select;
    setSong(songList.filter((item, index) => index != selection));
    if (selection == picking.current) {
      picking.current = 0;
      for (var i = 0; i < timeOuts.current.length; i++) {
        clearTimeout(timeOuts.current[i]);
      }
      setPause(false);
      timeOuts.current = [];
      timeRemaining.current = 0;
      setDisplay("");
    }
  };

  const downloadSong = () => {
    const choose = songList[picking.current];
    const content = JSON.stringify(choose);
    const a = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = choose[choose.length - 1].name + ".json";
    a.click();
  };

  const importSong = (event) => {
    if (event.target.files) {
      new Response(event.target.files[0]).json().then(
        (json) => {
          setSong((prev) => [...prev, json]);
          setDisplay("Success!");
        },
        (err) => {
          setDisplay("Wrong file!");
          console.log(err);
        }
      );
    }
  };
  return (
    <div className="drumwrapper">
      <div className="instruction mPower">Power</div>
      <div className="instruction mRecord">Record</div>
      <div className="instruction mPlay">Play</div>
      <div className="instruction mDownload">Download</div>
      <div className="instruction mImport">Import</div>
      <div id="drum-machine" className="drumset">
        <div className="drum-pad" id="Heater 1">
          <audio
            id="Q"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3"
                : ""
            }`}
          ></audio>
          Q
        </div>
        <div className="drum-pad" id="Heater 2">
          <audio
            id="W"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3"
                : ""
            }`}
          ></audio>
          W
        </div>
        <div className="drum-pad" id="Heater 3">
          <audio
            id="E"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3"
                : ""
            }`}
          ></audio>
          E
        </div>
        <div className="drum-pad" id="Heater 4">
          <audio
            id="A"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3"
                : ""
            }`}
          ></audio>
          A
        </div>
        <div className="drum-pad" id="Clap">
          <audio
            id="S"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3"
                : ""
            }`}
          ></audio>
          S
        </div>
        <div className="drum-pad" id="Open HH">
          <audio
            id="D"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3"
                : ""
            }`}
          ></audio>
          D
        </div>
        <div className="drum-pad" id="Kick n' Hat">
          <audio
            id="Z"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3"
                : ""
            }`}
          ></audio>
          Z
        </div>
        <div className="drum-pad" id="Kick">
          <audio
            id="X"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3"
                : ""
            }`}
          ></audio>
          X
        </div>
        <div className="drum-pad" id="Closed HH">
          <audio
            id="C"
            className="sound"
            src={`${
              toggle
                ? "https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3"
                : ""
            }`}
          ></audio>
          C
        </div>
      </div>
      <div className="controls">
        <div className="buttonClass export">
          <button onClick={() => downloadSong()} type="button">
            <FaFileDownload className="exp" />
          </button>
        </div>
        <div className="buttonClass import">
          <button
            onClick={() => document.getElementById("file").click()}
            type="button"
          >
            <LuImport className="imp" />
          </button>
          <input
            id="file"
            style={{ display: "none" }}
            type="file"
            onChange={(e) => importSong(e)}
          />
        </div>
        <input
          className="recordName"
          required
          type="text"
          placeholder="SONG NAME"
          onChange={(e) => setRecord(e.target.value)}
          onFocus={() => handleFocus()}
          value={recordName}
        />
        <div className={toggle ? "buttonClass" : "offClass"}>
          <button onClick={() => willToggle()} type="button" id="power">
            <FaPowerOff className={toggle ? "power" : "poweroff"} />
          </button>
        </div>
        <div className={toggle ? "buttonClass record" : "offClass record"}>
          <button onClick={() => record()} type="button" id="power">
            <PiRecordFill
              id="record"
              className={toggle ? "power rec" : "poweroff"}
            />
          </button>
        </div>
        <div className={toggle ? "buttonClass play" : "offClass play"}>
          {!pause ? (
            <button onClick={() => playBack()} type="button" id="power">
              <FaPlay
                id="play"
                className={toggle ? "power plIcon" : "poweroff plIcon"}
              />
            </button>
          ) : (
            <button onClick={() => paused()} type="button" id="power">
              <BsPauseFill
                id="pause"
                className={toggle ? "power paIcon" : "poweroff paIcon"}
              />
            </button>
          )}
        </div>

        <div className="slider">
          <div className="rangeWrapper">
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="1"
              step="0.01"
              defaultValue={vol}
              onChange={(e) => {
                setVol(e.target.value);
                setDisplay("Volume: " + Math.floor(e.target.value * 100));
              }}
            />
            <div className="marker marker-0">0</div>
            <div className="marker marker-25">25</div>
            <div className="marker marker-50">50</div>
            <div className="marker marker-75">75</div>
            <div className="marker marker-100">100</div>
          </div>
          <label
            id="display"
            className="volmark"
            htmlFor="volume"
            onClick={() => dropdown()}
          >
            <IoMdArrowDropdown id="drop" className="dropdown" />
            <div className="fixDisplay">{disp}</div>
            <div id="formDrop" className="formDrop hide">
              {songList &&
                songList.map((song, index) => {
                  return (
                    <div
                      onClick={(e) =>
                        e.currentTarget === e.target && chooseSong(e)
                      }
                      data-select={index}
                      key={index}
                      className="songg"
                    >
                      {song[song.length - 1].name}
                      <TiDelete
                        onClick={(e) => deleteSong(e)}
                        className="deleteSong"
                        data-select={index}
                      />
                    </div>
                  );
                })}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
