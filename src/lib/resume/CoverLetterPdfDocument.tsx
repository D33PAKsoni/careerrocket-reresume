import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetterContent, Profile } from "@/types/profile";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 11, fontFamily: "Helvetica", color: "#1f2937", lineHeight: 1.5 },
  senderBlock: { marginBottom: 24 },
  bold: { fontWeight: 700 },
  muted: { color: "#4b5563", fontSize: 10 },
  date: { color: "#4b5563", marginBottom: 24 },
  recipientBlock: { marginBottom: 24 },
  paragraph: { marginBottom: 14, color: "#1f2937" },
  signoff: { marginTop: 24 },
});

interface CoverLetterPdfProps {
  profile: Profile | null;
  content: CoverLetterContent | null;
}

export function CoverLetterPdfDocument({ profile, content }: CoverLetterPdfProps) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.senderBlock}>
          <Text style={styles.bold}>{profile?.full_name ?? ""}</Text>
          {profile?.location && <Text style={styles.muted}>{profile.location}</Text>}
          {profile?.phone && <Text style={styles.muted}>{profile.phone}</Text>}
          {profile?.linkedin_url && <Text style={styles.muted}>{profile.linkedin_url}</Text>}
        </View>

        <Text style={styles.date}>{today}</Text>

        <View style={styles.recipientBlock}>
          <Text>{content?.companyName ? `Hiring Team, ${content.companyName}` : "Hiring Team"}</Text>
          {content?.roleName && <Text style={styles.muted}>Re: {content.roleName} application</Text>}
        </View>

        {content?.hook && <Text style={styles.paragraph}>{content.hook}</Text>}
        {content?.evidence && <Text style={styles.paragraph}>{content.evidence}</Text>}
        {content?.close && <Text style={styles.paragraph}>{content.close}</Text>}

        <View style={styles.signoff}>
          <Text>Sincerely,</Text>
          <Text>{profile?.full_name ?? ""}</Text>
        </View>
      </Page>
    </Document>
  );
}
