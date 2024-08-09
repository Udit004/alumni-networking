// sparse matrix representation in triple format

#include<stdio.h>
#include<stdlib.h>

printf("This code is sparse matrix");

typedef struct sparseMatrix
{
    int row;
    int col;
    float val;
}triplet;

int **allocate(int **mat, int r, int c)  //allocation of matrix
{
    int i;
    mat = (int **)malloc(r*sizeof(int*));
    for(i=0; i<r; i++)
    {
        mat[i] = (int*)malloc(c*sizeof(int));
    }
    return mat;
}

void insert(int** mat, int r, int c)   //inserting data in matrix
{
    srand(time(0));
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            int randomVal = rand() % 10;
            if (randomVal < 6) {
                mat[i][j] = 0;  // 60% chance of being zero
            } else {
                mat[i][j] = rand() % 100 + 1;  // Random non-zero value between 1 and 100
            }
        }
    }
}

void display(int **mat, int r, int c)   //for display content of matrix
{
    int i,j;
    for(i=0; i<r; i++)
    {
        for(j=0; j<c; j++)
        {
            printf("%d\t",mat[i][j]);
        }
        printf("\n");
    }
}

void tdisplay(int** mat, int r)
{
    int i,j;
    for(i=0; i<=r; i++)
    {
        for(j=0; j<3; j++)
        {
            printf("%d\t",mat[i][j]);
        }
        printf("\n");
    }

}

void freemat(int **mat,int r)
{
    int i;
    for(i=0;i<r;i++)
    {
        free(mat[i]);
    }
    free(mat);
}

int main()
{
    int i,j,r,c,k=1;   //Declare row for triple format
    int u=0;
    int **matrix;
    triplet * tmat1, *transpose

    printf("enter the row and column of matrix: ");  //taking input of rows and column
    scanf("%d%d",&r,&c);
    matrix = allocate(matrix,r,c);


    printf("enter the element of matrix\n");   //inserting data in matrix
    insert(matrix ,r,c);


    printf("element of the matrix is\n");  //display element
    display(matrix,r,c);



    for(i=0; i<r; i++)
    {
        for(j=0; j<c; j++)
        {
            if(matrix[i][j] != 0)       //checking for non zero element in matrix
            {
                u++;
            }

        }
    }

    triplet = allocate(triplet,u+1,3);
    triplet[0][0] = r;
    triplet[0][1] = j;
    triplet[0][2] = u;
    for(i=0; i<r; i++)
    {
        for(j=0; j<c; j++)
        {
            if(matrix[i][j] != 0)       //checking for non zero element in matrix
            {
                triplet[k][0] = i;
                triplet[k][1] = j;
                triplet[k][2] = matrix[i][j];
                k++;
            }
        }
    }


    printf("triplet form of spare matrix\n");    //display triple format
    tdisplay(triplet,u);


    k=0;
    transpose = allocate(transpose,u+1,3);       // transpose of the triple format matrix
    for(i=0; i<triplet[0][1] ; i++)
    {
        for(j=1; j<=u; j++)
        {
            transpose[k][0] = triplet[j][1];
            transpose[k][1] = triplet[j][0];
            transpose[k][2] = triplet[j][2];
            k++;
        }
    }
    printf("transpose of the triple formate matrix\n");
    tdisplay(transpose,u);



    freemat(matrix,r);
    freemat(triplet,u+1);

    return 0;
}
