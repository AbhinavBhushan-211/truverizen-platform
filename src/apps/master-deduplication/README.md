# Master Deduplication App

## Overview

The Master Deduplication app is an advanced data deduplication tool that allows users to upload CSV/Excel files, configure filtering and matching criteria, and process data to identify and remove duplicates.

## Features

### 1. File Upload
- **Supported Formats**: CSV, XLS, XLSX
- **File Size Limit**: 50MB (configurable)
- **Auto-Detection**: Automatically detects columns and data types
- **Metadata Display**: Shows row count and column count

### 2. Configuration Panel (Segmented Tabs)

The configuration section uses animated segmented tabs with a sliding indicator, similar to iOS controls.

#### Tab 1: Data Filters
- **Purpose**: Filter data before processing
- **Features**:
  - Dynamic field list based on uploaded file columns
  - Text input for each column
  - Clear individual filters or reset all
  - Supports 5-20+ fields with scrollable area
  - Real-time filter application

#### Tab 2: Match Criteria
- **Purpose**: Configure how duplicates are detected
- **Features**:
  - Toggle chips for column selection
  - Select which columns to compare
  - Similarity threshold slider (0-100%)
  - Visual feedback for selected columns
  - Configurable matching logic

#### Tab 3: Output Columns
- **Purpose**: Choose which columns appear in final output
- **Features**:
  - Toggle chips for each column
  - Select/deselect columns
  - "Toggle All" quick action
  - Only selected columns appear in processed data

### 3. Data Preview Table
- **Features**:
  - Displays first 100 rows
  - Sticky header row
  - Horizontal and vertical scrolling
  - Auto-adjusting column widths
  - Updates after processing to show deduplicated data
  - Row count badge showing duplicates removed

### 4. Processing
- **Deduplication Logic**:
  - Uses selected match columns
  - Applies similarity threshold
  - Respects data filters
  - Shows processing indicator
  - Displays results summary

### 5. Export Options
- **Export CSV**: Download processed data as CSV
- **Export Excel**: Download as XLSX with formatting
- **Filename**: Auto-generated with original filename + "deduplicated"

## File Structure

```
/apps/master-deduplication/
├── index.tsx                 # App entry point
├── routes.tsx                # Route configuration
├── pages/
│   └── MainPage.tsx          # Main single-page interface
└── README.md                 # This file
```

## State Management

**Store**: `/store/masterDedup.slice.ts`

### State Properties:
- `uploadedFile`: Current file object
- `fileName`: Name of uploaded file
- `fileMetadata`: Row and column counts
- `columns`: Column information (name, type)
- `rawData`: Original uploaded data
- `filters`: Active filter values
- `matchColumns`: Columns selected for matching
- `outputColumns`: Columns selected for output
- `similarityThreshold`: Match sensitivity (0.0 - 1.0)
- `isProcessing`: Processing state flag
- `processedData`: Deduplicated results
- `duplicatesFound`: Count of removed duplicates

### Actions:
- `setUploadedFile()`: Initialize with file data
- `updateFilter()`: Set/clear column filter
- `resetFilters()`: Clear all filters
- `toggleMatchColumn()`: Enable/disable match column
- `toggleOutputColumn()`: Enable/disable output column
- `setSimilarityThreshold()`: Update match sensitivity
- `startProcessing()`: Begin deduplication
- `setProcessedData()`: Store results
- `reset()`: Clear all data and start over

## Component Architecture

### MainPage Component
Single-page interface with sections:
1. Header (title, description, version badge)
2. File Upload (drag-drop or click)
3. File Info Card (collapsible)
4. Configuration Tabs (animated segmented control)
5. Data Preview Table (scrollable)
6. Action Buttons (Process, Export)

### Key UI Components Used:
- `Card`, `CardHeader`, `CardContent` - Section containers
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Segmented navigation
- `Badge` - Toggle chips and status indicators
- `Slider` - Similarity threshold control
- `Table` - Data preview
- `ScrollArea` - Scrollable regions
- `Button` - Actions
- `Input` - Filter fields

## Usage Flow

### Step 1: Upload File
1. Click upload area or drag file
2. System validates file type
3. Parses data and extracts columns
4. Displays file metadata
5. Initializes all columns for matching and output

### Step 2: Configure Filters (Optional)
1. Switch to "Data Filters" tab
2. Enter filter values for desired columns
3. Data preview updates to show filtered results
4. Reset individual filters or all filters

### Step 3: Set Match Criteria
1. Switch to "Match Criteria" tab
2. Click column chips to toggle selection
3. Adjust similarity threshold slider
4. Selected columns will be used for duplicate detection

### Step 4: Choose Output Columns
1. Switch to "Output Columns" tab
2. Click column chips to toggle visibility
3. Use "Toggle All" for quick selection
4. Only selected columns appear in final export

### Step 5: Process Data
1. Click "Process Data" button
2. Watch processing indicator
3. View results summary
4. Preview deduplicated data in table

### Step 6: Export Results
1. Click "Export CSV" or "Export Excel"
2. File downloads automatically
3. Optional: Reprocess with different settings

## Technical Implementation

### File Parsing
Uses **XLSX** library for reading CSV and Excel files:
```typescript
import * as XLSX from 'xlsx';

// CSV files
const workbook = XLSX.read(data, { type: 'binary' });

// Excel files  
const workbook = XLSX.read(data, { type: 'array' });

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(firstSheet);
```

### Animated Tabs
The segmented tabs use Tailwind's transition classes for smooth animation:
- Tab indicator slides horizontally
- Content swaps without page reload
- Active state styling
- Hover effects

### Data Processing
Current implementation uses mock deduplication logic. In production:
1. Apply data filters
2. Compare rows based on selected match columns
3. Use similarity threshold for fuzzy matching
4. Remove duplicates based on criteria
5. Return only selected output columns

### Export Functionality
```typescript
// CSV Export
const worksheet = XLSX.utils.json_to_sheet(processedData);
const csv = XLSX.utils.sheet_to_csv(worksheet);
const blob = new Blob([csv], { type: 'text/csv' });

// Excel Export
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, 'filename.xlsx');
```

## Customization Options

### Match Algorithm
Replace mock logic in `handleProcess()` with actual deduplication:
- Implement fuzzy string matching
- Use similarity algorithms (Levenshtein, Jaro-Winkler)
- Weight column importance
- Handle numeric vs text comparisons

### UI Styling
All components use Tailwind CSS and can be customized:
- Colors via theme variables
- Spacing and sizing
- Responsive breakpoints
- Dark/light mode support

### Performance Optimization
For large datasets:
- Implement virtual scrolling for table
- Process data in chunks
- Use Web Workers for heavy computation
- Add pagination to preview

## Integration with Platform

### Routing
Added to `/routes/AppRoutes.tsx`:
```typescript
<Route path="apps/master-deduplication/*" element={<MasterDeduplicationApp />} />
```

### Applications Page
Listed in `/features/applications/pages/ApplicationsPage.tsx`:
```typescript
{
  id: 'deduplication',
  name: 'Master Deduplication',
  description: 'Advanced data deduplication...',
  status: 'available',
  path: '/apps/master-deduplication',
}
```

### History Tracking
When integrated with backend:
- Save processing sessions to history
- Store original and processed files
- Track user actions
- Enable file retrieval from history

## Future Enhancements

### Potential Features:
1. **Advanced Matching**:
   - Machine learning-based similarity
   - Column weighting system
   - Custom match rules

2. **Batch Processing**:
   - Process multiple files at once
   - Scheduled deduplication jobs
   - API integration

3. **Data Validation**:
   - Pre-processing data quality checks
   - Missing value handling
   - Data type validation

4. **Reporting**:
   - Detailed deduplication reports
   - Before/after statistics
   - Duplicate group visualization

5. **Collaboration**:
   - Share configurations
   - Team presets
   - Processing templates

## Troubleshooting

### File Upload Issues
- **Problem**: File not parsing
- **Solution**: Ensure file is valid CSV/Excel format, check for encoding issues

### Memory Issues
- **Problem**: Browser crashes with large files
- **Solution**: Implement chunking, use backend processing for files >50MB

### Matching Not Working
- **Problem**: No duplicates found
- **Solution**: Lower similarity threshold, verify match columns are selected

### Export Failing
- **Problem**: Download doesn't start
- **Solution**: Check browser popup blocker, verify processed data exists

## Best Practices

1. **File Preparation**:
   - Clean data before upload
   - Ensure consistent column names
   - Remove special characters if needed

2. **Filter Usage**:
   - Apply filters before processing for better performance
   - Use specific filters to reduce dataset size

3. **Match Configuration**:
   - Start with higher threshold (80-90%)
   - Gradually lower if needed
   - Test with small sample first

4. **Output Selection**:
   - Include unique identifiers
   - Keep essential columns only
   - Remove sensitive data if needed

## Support

For issues or feature requests related to Master Deduplication:
1. Check this documentation
2. Review the code in `/apps/master-deduplication/`
3. Contact support via Help page
4. Submit bug reports with sample data (sanitized)

---

**Version**: 1.0.0
**Last Updated**: November 17, 2025
**Dependencies**: React, XLSX, Zustand, Tailwind CSS
