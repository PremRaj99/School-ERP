import Navigation from "@/components/custom/Student/Home/Navigation";
import Profile from "@/components/custom/Student/Home/Profile";
import { BreadcrumbResponsive } from '../../components/custom/BreadCrum';

export default function page() {
  const items = [
    {
      // href: "/student",
      label: "Student"
    },
  ]
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items}  />
      {/* Profile */}
      <Profile />
      {/* Navigation */}
      <Navigation />
    </div>
  );
}
