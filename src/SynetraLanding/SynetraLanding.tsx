import { useNavigate } from "react-router-dom";
import "./SynetraLanding.css"



export default function SynetraLanding() {
  const navigate = useNavigate();

  return (
    <>
    <h2 className="landing">Landing Page</h2>
    <button className="btn-primary landing2" onClick={() => navigate("/login")}>
            Login
    </button>
    </>
  );
}
