// checkSession.js
export const checkSession = async () => {
  const res = await fetch('http://localhost:3030/api/check-session', {
    method: 'GET',
    credentials: 'include', 
  });
  const data = await res.json();
  return data;
};
