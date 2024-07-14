// src/utils/dateUtils.js
export const calculateRevisitDate = (startDate = new Date(), days = 14) => {
    const revisitDate = new Date(startDate);
    revisitDate.setDate(revisitDate.getDate() + days);
    return revisitDate;
  };
  