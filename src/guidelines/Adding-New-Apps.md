# Adding a New Application to Truverizen Platform

This guide explains how to add a new application and workflow to the Truverizen Platform. The architecture is designed to allow teams to work independently on different applications without touching the core codebase.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Step-by-Step Guide](#step-by-step-guide)
3. [Example: Adding OCR Application](#example-adding-ocr-application)
4. [Best Practices](#best-practices)
5. [Testing Your Application](#testing-your-application)

---

## Quick Start

To add a new application, you need to:

1. Create a new folder under `/apps/your-app-name`
2. Create workflow pages
3. Create an index.tsx with routing
4. Register the app in AppRoutes
5. Update the Applications page
6. (Optional) Add Zustand store for state management

---

## Step-by-Step Guide

### Step 1: Create Application Folder Structure

Create a new folder under `/apps/` with your application name:

```
/apps/
  ├── court-index/           # Existing app
  └── your-app-name/         # New app
      ├── index.tsx          # Main app component with routing
      ├── pages/             # Workflow pages
      │   ├── StepOnePage.tsx
      │   ├── StepTwoPage.tsx
      │   └── StepThreePage.tsx
      ├── components/        # (Optional) App-specific components
      └── utils/             # (Optional) App-specific utilities
```

### Step 2: Create Workflow Pages

Create your workflow pages in `/apps/your-app-name/pages/`. Each page represents a step in your workflow.

**Example: `/apps/your-app-name/pages/StepOnePage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ArrowRight } from 'lucide-react';

export function StepOnePage() {
  const navigate = useNavigate();

  const handleNext = () => {
    // Process data or save to store
    navigate('/apps/your-app-name/step-two');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2>Step One Title</h2>
        <p className="text-muted-foreground">Step description</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Your form or content here */}
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext}>
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Create App Index with Routing

Create `/apps/your-app-name/index.tsx` to handle routing within your app:

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { StepOnePage } from './pages/StepOnePage';
import { StepTwoPage } from './pages/StepTwoPage';
import { StepThreePage } from './pages/StepThreePage';

export function YourAppNameApp() {
  return (
    <Routes>
      <Route index element={<Navigate to="step-one" replace />} />
      <Route path="step-one" element={<StepOnePage />} />
      <Route path="step-two" element={<StepTwoPage />} />
      <Route path="step-three" element={<StepThreePage />} />
    </Routes>
  );
}
```

### Step 4: Register App in Main Routes

Edit `/routes/AppRoutes.tsx` to add your app:

```tsx
import { YourAppNameApp } from '../apps/your-app-name';

export function AppRoutes() {
  return (
    <Routes>
      {/* ... existing routes ... */}
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* ... existing routes ... */}
        
        {/* Your New App */}
        <Route path="apps/your-app-name/*" element={<YourAppNameApp />} />
      </Route>
    </Routes>
  );
}
```

### Step 5: Update Applications Page

Edit `/features/applications/pages/ApplicationsPage.tsx` to add your app to the applications array:

```tsx
const applications: Application[] = [
  // ... existing apps ...
  {
    id: 'your-app-name',
    name: 'Your App Display Name',
    description: 'Description of what your app does',
    icon: YourIcon, // Import from lucide-react
    status: 'available', // or 'coming-soon'
    path: '/apps/your-app-name',
    stats: [ // Optional
      { label: 'Metric 1', value: '123' },
      { label: 'Metric 2', value: '456' },
    ],
  },
];
```

### Step 6: (Optional) Create Zustand Store

If your app needs state management, create a store slice:

**Create `/store/yourAppName.slice.ts`:**

```tsx
import { StateCreator } from 'zustand';

export interface YourAppNameState {
  // State
  currentStep: string;
  data: any | null;
  isProcessing: boolean;

  // Actions
  setCurrentStep: (step: string) => void;
  setData: (data: any) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'step-one',
  data: null,
  isProcessing: false,
};

export const createYourAppNameSlice: StateCreator<YourAppNameState> = (set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),
  setData: (data) => set({ data }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  reset: () => set(initialState),
});
```

**Update `/store/index.ts`:**

```tsx
import { create } from 'zustand';
import { AuthState, createAuthSlice } from './auth.slice';
import { SidebarState, createSidebarSlice } from './sidebar.slice';
import { CourtIndexState, createCourtIndexSlice } from './courtIndex.slice';
import { YourAppNameState, createYourAppNameSlice } from './yourAppName.slice';

type StoreState = AuthState & SidebarState & CourtIndexState & YourAppNameState;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createSidebarSlice(...a),
  ...createCourtIndexSlice(...a),
  ...createYourAppNameSlice(...a),
}));
```

**Use the store in your pages:**

```tsx
import { useStore } from '../../../store';

export function StepOnePage() {
  const { data, setData, isProcessing } = useStore();
  
  // Use your state...
}
```

---

## Example: Adding OCR Application

Let's walk through a complete example of adding an OCR Processing application.

### 1. Create Folder Structure

```
/apps/ocr/
  ├── index.tsx
  └── pages/
      ├── UploadPage.tsx
      ├── ProcessingPage.tsx
      └── ResultsPage.tsx
```

### 2. Create Upload Page

**`/apps/ocr/pages/UploadPage.tsx`:**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Upload, FileImage } from 'lucide-react';
import { useStore } from '../../../store';

export function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { setOcrData } = useStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    // Save file to store
    setOcrData({ file, uploadedAt: new Date() });
    
    // Navigate to processing
    navigate('/apps/ocr/processing');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2>OCR Processing</h2>
        <p className="text-muted-foreground">
          Upload an image or scanned document to extract text
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Supported formats: JPG, PNG, PDF, TIFF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-4 border rounded-lg">
              <FileImage className="h-5 w-5 text-primary" />
              <span>{file.name}</span>
              <span className="text-muted-foreground">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Start OCR Processing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Create Processing Page

**`/apps/ocr/pages/ProcessingPage.tsx`:**

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Loader } from '../../../components/common/Loader';

export function ProcessingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate processing
    const timer = setTimeout(() => {
      navigate('/apps/ocr/results');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2>Processing Document</h2>
        <p className="text-muted-foreground">
          Extracting text from your document...
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OCR in Progress</CardTitle>
          <CardDescription>This may take a few moments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-8">
            <Loader />
          </div>
          <Progress value={65} />
          <p className="text-center text-muted-foreground">
            Analyzing document structure and extracting text...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Create Results Page

**`/apps/ocr/pages/ResultsPage.tsx`:**

```tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { CheckCircle, Download, RotateCcw } from 'lucide-react';

export function ResultsPage() {
  const navigate = useNavigate();

  const extractedText = "This is the extracted text from your document...";

  const handleNewUpload = () => {
    navigate('/apps/ocr/upload');
  };

  const handleDownload = () => {
    // Create and download text file
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2>OCR Complete</h2>
        <p className="text-muted-foreground">
          Text extraction completed successfully
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Extracted Text</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={extractedText}
            readOnly
            className="min-h-[300px]"
          />

          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Text
            </Button>
            <Button onClick={handleNewUpload} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Create App Index

**`/apps/ocr/index.tsx`:**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';

export function OcrApp() {
  return (
    <Routes>
      <Route index element={<Navigate to="upload" replace />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="processing" element={<ProcessingPage />} />
      <Route path="results" element={<ResultsPage />} />
    </Routes>
  );
}
```

### 6. Create Store Slice

**`/store/ocr.slice.ts`:**

```tsx
import { StateCreator } from 'zustand';

export interface OcrState {
  data: {
    file: File | null;
    uploadedAt: Date | null;
    extractedText: string | null;
  } | null;
  isProcessing: boolean;

  setOcrData: (data: any) => void;
  setExtractedText: (text: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  resetOcr: () => void;
}

const initialState = {
  data: null,
  isProcessing: false,
};

export const createOcrSlice: StateCreator<OcrState> = (set) => ({
  ...initialState,

  setOcrData: (data) => set({ data }),
  setExtractedText: (extractedText) =>
    set((state) => ({
      data: state.data ? { ...state.data, extractedText } : null,
    })),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  resetOcr: () => set(initialState),
});
```

### 7. Register in AppRoutes

**Edit `/routes/AppRoutes.tsx`:**

```tsx
import { OcrApp } from '../apps/ocr';

// Inside the Routes:
<Route path="apps/ocr/*" element={<OcrApp />} />
```

### 8. Update Applications Page

**Edit `/features/applications/pages/ApplicationsPage.tsx`:**

```tsx
import { FileSearch } from 'lucide-react';

const applications: Application[] = [
  // ... existing apps ...
  {
    id: 'ocr',
    name: 'OCR Processing',
    description: 'Extract text from scanned documents and images with high accuracy',
    icon: FileSearch,
    status: 'available', // Changed from 'coming-soon'
    path: '/apps/ocr',
    stats: [
      { label: 'Documents', value: '832' },
      { label: 'Languages', value: '12' },
    ],
  },
];
```

---

## Best Practices

### 1. **Keep Apps Self-Contained**
- Each app should be independent and self-contained
- Don't create dependencies between apps
- App-specific components go in `/apps/your-app/components/`
- App-specific utilities go in `/apps/your-app/utils/`

### 2. **Use Shared Components**
- Utilize components from `/components/ui/` (ShadCN)
- Use common components from `/components/common/`
- Use layout components from `/components/layout/`

### 3. **State Management**
- Use Zustand for complex state that needs to persist across pages
- Use local state (useState) for simple UI state
- Always provide a reset function in your store slice

### 4. **Routing**
- App routes should follow the pattern: `/apps/your-app-name/*`
- Use nested routes within your app for workflow steps
- Always provide a default redirect (index route)

### 5. **Navigation**
- Use React Router's `useNavigate` for programmatic navigation
- Use relative paths within your app: `navigate('step-two')`
- Use absolute paths to exit your app: `navigate('/dashboard')`

### 6. **Error Handling**
- Add error boundaries for production apps
- Handle file upload errors gracefully
- Provide clear error messages to users

### 7. **Loading States**
- Use the Loader component from `/components/common/Loader`
- Use Progress bars for long operations
- Provide feedback during async operations

### 8. **Responsive Design**
- Test your app on mobile, tablet, and desktop
- Use responsive Tailwind classes (sm:, md:, lg:)
- Use the `useResponsive` hook if needed

### 9. **Accessibility**
- Use semantic HTML
- Provide labels for form inputs
- Use ARIA attributes where appropriate
- Ensure keyboard navigation works

### 10. **Code Organization**
```
/apps/your-app-name/
  ├── index.tsx              # Main app component with routing
  ├── pages/                 # Workflow pages
  │   ├── StepOne.tsx
  │   ├── StepTwo.tsx
  │   └── StepThree.tsx
  ├── components/            # App-specific components
  │   ├── CustomForm.tsx
  │   └── DataTable.tsx
  ├── utils/                 # App-specific utilities
  │   ├── validation.ts
  │   └── transform.ts
  └── types.ts               # App-specific TypeScript types
```

---

## Testing Your Application

### Manual Testing Checklist

- [ ] App appears on the Applications page
- [ ] Clicking the app tile navigates to your app
- [ ] All workflow steps are accessible
- [ ] Navigation between steps works correctly
- [ ] Data persists between page navigations (if using store)
- [ ] Back button works as expected
- [ ] App is responsive on different screen sizes
- [ ] Forms validate correctly
- [ ] Error states display properly
- [ ] Loading states show during async operations
- [ ] Success messages display correctly
- [ ] User can navigate back to dashboard/applications

### Testing Navigation

```tsx
// Test these paths in your browser:
/apps/your-app-name           // Should redirect to first step
/apps/your-app-name/step-one  // Should show first step
/apps/your-app-name/step-two  // Should show second step
```

### Testing State Management

```tsx
// In your component:
console.log('Current state:', useStore.getState().yourAppData);

// Test that state persists:
// 1. Set data on step one
// 2. Navigate to step two
// 3. Check that data is still available
```

---

## Common Patterns

### Pattern 1: Multi-Step Form Workflow

```tsx
// Track current step in store
const { currentStep, setCurrentStep } = useStore();

// Navigation helper
const goToNextStep = () => {
  const steps = ['upload', 'configure', 'process', 'results'];
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < steps.length - 1) {
    setCurrentStep(steps[currentIndex + 1]);
    navigate(`/apps/your-app/${steps[currentIndex + 1]}`);
  }
};
```

### Pattern 2: File Upload with Progress

```tsx
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file: File) => {
  setIsUploading(true);
  
  // Simulate progress
  for (let i = 0; i <= 100; i += 10) {
    setUploadProgress(i);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  setIsUploading(false);
  navigate('next-step');
};
```

### Pattern 3: Data Table with Actions

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';

export function ResultsTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>
              <Button size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Pattern 4: Conditional Rendering Based on Role

```tsx
import { useStore } from '../../../store';

export function AdminOnlyFeature() {
  const { user } = useStore();
  
  if (user?.role !== 'admin') {
    return null;
  }
  
  return (
    <Card>
      {/* Admin-only content */}
    </Card>
  );
}
```

---

## Troubleshooting

### Issue: App doesn't appear on Applications page
- Check that you added the app to the `applications` array
- Verify the `status` is set to `'available'`
- Check that the `path` matches your route in AppRoutes

### Issue: Navigation not working
- Ensure you imported `useNavigate` from 'react-router-dom'
- Verify the path matches your route configuration
- Check that the route is registered in AppRoutes.tsx

### Issue: State not persisting
- Verify you created and registered the store slice
- Check that you're using the correct store hook
- Ensure you're calling the setter functions correctly

### Issue: Components not found
- Check import paths are correct (relative paths with `../`)
- Verify component names match the exports
- Ensure shared components are imported from `/components/`

### Issue: Styles not applying
- Check Tailwind classes are correct
- Verify no conflicting styles
- Use browser DevTools to inspect elements

---

## Summary

To add a new app to Truverizen Platform:

1. **Create** `/apps/your-app-name/` folder structure
2. **Build** your workflow pages in `/pages/`
3. **Create** `/apps/your-app-name/index.tsx` with routing
4. **Register** app route in `/routes/AppRoutes.tsx`
5. **Add** app to Applications page array
6. **Create** store slice if needed (optional)
7. **Test** your application thoroughly

The platform is designed to scale with your team. Each application is independent, allowing multiple teams to work simultaneously without conflicts. Shared components, utilities, and layout ensure consistency across all applications.

---

## Need Help?

- Check existing apps (court-index) for reference
- Review ShadCN component documentation in `/components/ui/`
- Look at shared components in `/components/common/`
- Check store examples in `/store/`
- Review routing examples in `/routes/AppRoutes.tsx`

Happy coding! 🚀
