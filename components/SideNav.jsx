import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";

export default function SideNav(props) {
  const {
    showNav,
    setShowNav,
    noteIds,
    setNoteIds,
    handleCreateNote,
    setIsViewer,
  } = props;
  const { logout, currentUser } = useAuth();

  const ref = useRef();
  const router = useRouter();

  async function deleteNote(noteIdx) {
    try {
      const noteRef = doc(db, "users", currentUser.uid, "notes", noteIdx);
      await deleteDoc(noteRef);
      setNoteIds((curr) => {
        return curr.filter((idx) => idx !== noteIdx);
      });
    } catch (err) {
      console.log(err.message);
    } finally {
    }
  }
  useEffect(() => {
    console.log("ref: ", ref);
    //this is the code that will be executed when our ref changes (so in this case it's when ref is assigned)
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowNav(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // cleanup - unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    async function fetchIndexes() {
      try {
        const notesRef = collection(db, "users", currentUser.uid, "notes");
        const snapshot = await getDocs(notesRef);
        const notesIndexes = snapshot.docs.map((doc) => doc.id);
        setNoteIds(notesIndexes);
      } catch (err) {
        console.log(err.message);
      } finally {
      }
    }
    fetchIndexes();
  }, [currentUser]);

  return (
    <section ref={ref} className={"nav " + (showNav ? "" : " hidden-nav")}>
      <h1 className="text-gradient">MDNOTES</h1>
      <h6>Easy Breezy Notes</h6>
      <div className="full-line"></div>
      <button onClick={handleCreateNote}>
        <h6>New Note</h6>
        <i className="fa-solid fa-plus"></i>
      </button>
      <div className="notes-list">
        {noteIds.length == 0 ? (
          <p>You have 0 notes</p>
        ) : (
          noteIds.map((noteId, idx) => {
            const [n, d] = noteId.split("__");
            const date = new Date(parseInt(d)).toString();
            return (
              <button
                onClick={() => {
                  router.push(`/notes?id=` + noteId);
                  setIsViewer(true);
                }}
                className="card-button-secondary list-btn"
                key={idx}
              >
                <p>{n}</p>
                <small>{date.split(" ").slice(0, 4).join(" ")}</small>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(noteId);
                  }}
                  className="delete-btn"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="full-line"></div>
      <button onClick={logout}>
        <h6>Logout</h6>
        <i className="fa-solid fa-right-from-bracket"></i>
      </button>
    </section>
  );
}
