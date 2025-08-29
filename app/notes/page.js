"use client";
import { useState, useEffect } from "react";
import SideNav from "@/components/SideNav";
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
export default function NotesPage() {
  const [isViewer, setIsViewer] = useState(true);
  // const [text, setText] = useState("");
const [showNav, setShowNav] = useState(false);
const { currentUser, isLoadingUser } = useAuth();
const searchParams = useSearchParams();
const [note, setNote] = useState({content: ""});
const [isLoading, setIsLoading] = useState(false);
const [noteIds, setNoteIds] = useState([]);
const [savingNote, setSavingNote] = useState(false);



  function handleToggleViewer() {
    console.log("ISVIEWER: ", isViewer);
    setIsViewer(!isViewer);
  }

  function handleToggleMenu() {
    setShowNav(!showNav);
  }
  
  function handleCreateNote() {
    setNote({content: ""});
    setIsViewer(false);
    window.history.replaceState(null, "", "/notes");

  }

  function handleEditNote(e) {
    // edit an existing note
    setNote({...note, content: e.target.value});

  }

  async function handleSaveNote() {
    if(!note?.content) {
      console.log("Note cannot be empty");
      return;
    }
    setSavingNote(true);

    try {
      // see if note already exists in database
      if(note.id) {
        // then we have an existing note
        const notesRef = doc(db, "users", currentUser.uid, "notes", note.id);
        const newDocInfo = await setDoc(notesRef, {...note}, {merge: true});
      } else {
        // that means that it's a new note and will only contain the content field, so we can basically save a new note to firebase
        const newId = note.content.replaceAll("#", "").slice(0, 15) + "__" + Date.now();
        const notesRef = doc(db, "users", currentUser.uid, "notes", newId);
        const newDocInfo = await setDoc(notesRef, {content: note.content, createdAt: serverTimestamp()});
        setNoteIds((curr) => {
          return [...curr, newId];
        });
        setNote({...note, id: newId});
        window.history.pushState(null, "", `?id=${newId}`);
      }


    } catch(err){
      console.log(err.message)
    } finally {
      setSavingNote(false);
    }

  }

  useEffect(() => {
    // locally cache notes in a global context (like the one we already have, you perhaps just need an extra state.
    const value = searchParams.get("id");
    if(!value || !currentUser) {
      return;
    }
    async function fetchNote() {
      if(isLoading) {
        return;
      }
      try{
        setIsLoading(true);
        const notesRef = doc(db, "users", currentUser.uid, "notes", value);
        const snapshot = await getDoc(notesRef);
         const docData = snapshot.exists() ? {...snapshot.data(), id: snapshot.id} : null;
         if(docData) {
          setNote({...docData});
         }
      } catch(err){
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNote();
  }, [currentUser, searchParams]);


  if(isLoadingUser) {
    return <h6 className="text-gradient">Loading...</h6>;
  }
  
  if(!currentUser) {
    // if no user found redirect to homepage
    window.location.href = "/";
  }
  return (
  <main id="notes">
    <SideNav setIsViewer={setIsViewer} handleCreateNote={handleCreateNote} noteIds={noteIds} setNoteIds={setNoteIds} showNav={showNav} setShowNav={setShowNav} />
    {!isViewer && <Editor savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} text={note.content} setText={handleEditNote} isViewer={isViewer} handleToggleViewer={handleToggleViewer} />}
    {isViewer && <MDX savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} text={note.content} isViewer={isViewer} handleToggleViewer={handleToggleViewer}/>}
  </main>);
}