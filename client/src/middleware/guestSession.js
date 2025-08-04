export const createGuestSession = async () => {
  const res = await fetch('http://localhost:3030/api/guest-session', {
    method: 'POST',
    credentials: 'include', 
  });
  const data = await res.json();
  console.log(data);
  return data;
};
