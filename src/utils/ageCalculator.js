/**
 * Utility for precise age calculation in Years, Months, and Days
 * Supports calculation up to today or up to date of death if specified.
 */

export function calculateAge(dobString, deathDateString = null, targetDate = new Date()) {
  if (!dobString) {
    return {
      years: 0,
      months: 0,
      days: 0,
      formattedString: 'Tanggal lahir tidak valid',
      shortString: '-',
      isBirthdayToday: false
    };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return {
      years: 0,
      months: 0,
      days: 0,
      formattedString: 'Tanggal lahir tidak valid',
      shortString: '-',
      isBirthdayToday: false
    };
  }

  const endDate = deathDateString ? new Date(deathDateString) : targetDate;
  
  if (birthDate > endDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
      formattedString: 'Belum lahir',
      shortString: 'Belum lahir',
      isBirthdayToday: false
    };
  }

  let years = endDate.getFullYear() - birthDate.getFullYear();
  let months = endDate.getMonth() - birthDate.getMonth();
  let days = endDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    // Get total days in previous month of endDate
    const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Check if today is birthday
  const today = new Date();
  const isBirthdayToday = !deathDateString &&
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate();

  // Formatted string
  let parts = [];
  if (years > 0) parts.push(`${years} Thn`);
  if (months > 0) parts.push(`${months} Bln`);
  if (days > 0 || parts.length === 0) parts.push(`${days} Hari`);

  const formattedString = parts.join(' ');
  const fullString = `${years} Tahun${months > 0 ? `, ${months} Bulan` : ''}${days > 0 ? `, ${days} Hari` : ''}`;

  return {
    years,
    months,
    days,
    formattedString: deathDateString ? `${fullString} (Saat Wafat)` : fullString,
    shortString: deathDateString ? `${years} Thn (Wafat)` : `${years} Thn`,
    isBirthdayToday
  };
}

export function formatDateIndonesian(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
