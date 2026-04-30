import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FALLBACK = {
  company_name: "DRISHTI",
  tagline: "Your Insight Into Data.",
  contact_email: "info@drishti-aidc.com",
  contact_phone: "+91 98XXX XXXXX",
  address: "Bengaluru, India",
  business_hours: "Mon–Sat · 9:30 AM – 6:30 PM IST",
  notification_email: "",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(FALLBACK);
  useEffect(() => {
    let alive = true;
    axios.get(`${API}/site-settings`)
      .then((res) => { if (alive) setSettings({ ...FALLBACK, ...res.data }); })
      .catch(() => { /* keep fallback */ });
    return () => { alive = false; };
  }, []);
  return settings;
}
