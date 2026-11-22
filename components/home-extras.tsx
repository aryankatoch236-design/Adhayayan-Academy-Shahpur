import type { Course } from "@/lib/data";

export function NoticeBoard({ courses }: { courses: Course[] }) {
  return <aside className="board" aria-label="Courses at Adhyayan Academy">
    <header className="board-head">
      <img src="/logo-mark.png" alt="" width={56} height={42} />
      <div><strong>Courses at Adhyayan</strong><span>Shahpur, Kangra</span></div>
    </header>
    <ul>{courses.slice(0, 7).map(c => <li key={c.slug}><a href={`/courses/${c.slug}`}><span>{c.title}</span><small>{c.category}</small></a></li>)}</ul>
    <p className="board-foot">Call or WhatsApp us for batch timings and fees.</p>
  </aside>;
}

export function Ridge() {
  return <div className="ridge" aria-hidden="true">
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0 90V62L110 40L190 54L320 18L410 48L540 10L640 44L770 24L890 56L1010 16L1120 46L1250 28L1350 52L1440 34V90Z" /></svg>
  </div>;
}

export function Audience() {
  return <section className="section who-section" id="who">
    <div className="container">
      <h2>Who studies here</h2>
      <p className="who-lead">Students from Class 6 to 12, and young people in and around Shahpur preparing for a job or an entrance exam.</p>
      <div className="who-grid">
        <div><h3>School students</h3><p>CBSE tuition for Class 6 to 12 in Medical, Non-Medical and Commerce. Also entrance preparation for RIMC, RIMS, Sainik schools and Navodaya (JNVST).</p></div>
        <div><h3>Government job aspirants</h3><p>HPPSC, Patwari, Panchayat Inspector, Naib Tehsildar, Sub Inspector, JOA-IT and other state competitive exams of Himachal Pradesh.</p></div>
        <div><h3>Teaching, defence and entrance</h3><p>TGT, HP-TET, CTET and EMRS. Agniveer, SSC-GD and Clerk. NEET, JEE, NDA and CDSE.</p></div>
      </div>
    </div>
  </section>;
}

export function Steps() {
  return <section className="section steps-section" id="join">
    <div className="container steps-wrap">
      <div><h2>How to join</h2><p className="who-lead">No forms to fill first. Talk to us, see the academy, then decide.</p></div>
      <ol className="steps">
        <li><strong>Call or WhatsApp us</strong><span>Tell us the class or exam you are preparing for.</span></li>
        <li><strong>Visit the academy</strong><span>3rd floor, above the PNB Bank building, NH154, Shahpur.</span></li>
        <li><strong>Choose your course and batch</strong><span>We explain the timings and the fee before you decide.</span></li>
        <li><strong>Start your classes</strong><span>Begin the preparation with a clear plan.</span></li>
      </ol>
    </div>
  </section>;
}
