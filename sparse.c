#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Structure to represent a sparse matrix in triplet form
struct SparseMatrix {
    int row;
    int col;
    float value;
};

// Function to convert a matrix into sparse matrix representation
int convertToSparse(float** matrix, int rows, int cols, struct SparseMatrix** sparse) {
    int k = 0;
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            if (matrix[i][j] != 0.0f) {
                *sparse = realloc(*sparse, (k + 1) * sizeof(struct SparseMatrix));
                (*sparse)[k].row = i;
                (*sparse)[k].col = j;
                (*sparse)[k].value = matrix[i][j];
                k++;
            }
        }
    }
    return k;
}

// Function to transpose a sparse matrix
void transposeSparse(struct SparseMatrix* sparse, int count, struct SparseMatrix** transpose) {
    *transpose = malloc(count * sizeof(struct SparseMatrix));
    for (int i = 0; i < count; i++) {
        (*transpose)[i].row = sparse[i].col;
        (*transpose)[i].col = sparse[i].row;
        (*transpose)[i].value = sparse[i].value;
    }
}

// Function to print the sparse matrix
void printSparseMatrix(struct SparseMatrix* sparse, int count) {
    printf("Row\tCol\tValue\n");
    for (int i = 0; i < count; i++) {
        printf("%d\t%d\t%.2f\n", sparse[i].row, sparse[i].col, sparse[i].value);
    }
}

// Function to generate a random matrix with more than 60% zeros
void generateRandomMatrix(float** matrix, int rows, int cols) {
    int totalElements = rows * cols;
    int nonZeroElements = (int)(totalElements * 0.4); // 40% of the total elements are non-zero
    srand(time(0));

    // Initialize the matrix with all zeros
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] = 0.0f;
        }
    }

    // Randomly assign non-zero values
    for (int i = 0; i < nonZeroElements; i++) {
        int randRow = rand() % rows;
        int randCol = rand() % cols;
        float randValue = (float)(rand() % 1000) / 10.0f; // random float between 0.0 and 99.9

        // Ensure that the selected element is zero before assigning a non-zero value
        while (matrix[randRow][randCol] != 0.0f) {
            randRow = rand() % rows;
            randCol = rand() % cols;
        }

        matrix[randRow][randCol] = randValue;
    }
}

int main() {
    int rows, cols, nonZeroCount;
    float** matrix;
    struct SparseMatrix* sparse = NULL;
    struct SparseMatrix* transpose = NULL;

    printf("Enter the number of rows and columns of the matrix: ");
    scanf("%d %d", &rows, &cols);

    // Dynamically allocate memory for the matrix
    matrix = malloc(rows * sizeof(float*));
    for (int i = 0; i < rows; i++) {
        matrix[i] = malloc(cols * sizeof(float));
    }

    // Generate a random matrix
    generateRandomMatrix(matrix, rows, cols);

    // Display the generated matrix
    printf("\nGenerated Matrix:\n");
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            printf("%.2f\t", matrix[i][j]);
        }
        printf("\n");
    }

    // Convert to sparse matrix
    nonZeroCount = convertToSparse(matrix, rows, cols, &sparse);
    
    // Print sparse matrix
    printf("\nSparse Matrix Representation (Triplet format):\n");
    printSparseMatrix(sparse, nonZeroCount);

    // Transpose the sparse matrix
    transposeSparse(sparse, nonZeroCount, &transpose);

    // Print the transposed sparse matrix
    printf("\nTransposed Sparse Matrix Representation (Triplet format):\n");
    printSparseMatrix(transpose, nonZeroCount);

    // Free allocated memory
    for (int i = 0; i < rows; i++) {
        free(matrix[i]);
    }
    free(matrix);
    free(sparse);
    free(transpose);

    return 0;
}
